pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title ClassifiedsAdvanced
 * @notice Implements the classifieds board market
 */
contract ClassifiedsAdvanced is IERC721Receiver {

    using SafeMath for uint256;

    struct Ad {
        address poster;
        address token;
        uint256 descriptor;
        uint256 deadline;
        bool isCollectible;
        bool cancelled;
        bool resolved;
    }

    mapping(uint256 => bytes[]) public adsByCreationDateInMin;

    mapping(bytes => Ad) public adsByHash;

    mapping(bytes => bytes[]) public fillersByAd;

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    )
    public returns (bytes4) {
        return bytes4(
            keccak256("onERC721Received(address,address,uint256,bytes)")
        );
    }

    /**
     * @dev Creates a new ad. Must have approved this contract to spend _descriptor of _token.
     * @param _token An ERC20 token, or an ERC721 token
     * @param _descriptor The amount of ERC20 token or the tokenId of ERC721 token
     * @param _deadline The time when the ad will expire
     * @param _isCollectible Whether _token is of type ERC721 or not (ERC20)
     */
    function newAd(
        address _token,
        uint256 _descriptor,
        uint256 _deadline,
        bool _isCollectible
    ) public {
        // solium-disable-next-line security/no-block-members
        require(_deadline > now, "Deadline cannot be set before now.");
        if (_isCollectible) {
            IERC721(_token).safeTransferFrom(msg.sender, address(this), _descriptor);
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _descriptor);
        }
        bytes memory adHash = abi.encodePacked(
            msg.sender,
            _token,
            _descriptor,
            _deadline,
            _isCollectible,
            // solium-disable-next-line security/no-block-members
            adsByCreationDateInMin[now.div(60)].length
        );
        // solium-disable-next-line security/no-block-members
        adsByCreationDateInMin[now.div(60)].push(adHash);
        adsByHash[adHash] = Ad(
            msg.sender,
            _token,
            _descriptor,
            _deadline,
            _isCollectible,
            false,
            false
        );
    }

    /**
     * @dev Fills an ad. Must have approved this contract to spend _descriptor of _token.
     * @param _ad The hash of an existing ad
     * @param _token An ERC20 token, or an ERC721 token
     * @param _descriptor The amount of ERC20 token or the tokenId of ERC721 token
     * @param _isCollectible Whether _token is of type ERC721 or not (ERC20)
     */
    function fillAd(
        bytes memory _ad,
        address _token,
        uint256 _descriptor,
        bool _isCollectible
    ) public {
        Ad memory ad = adsByHash[_ad];
        require(
            // solium-disable-next-line security/no-block-members
            !(ad.cancelled || ad.resolved) && ad.deadline > now,
            "Cannot fill expired ad."
        );
        if (_isCollectible) {
            IERC721(_token).safeTransferFrom(msg.sender, address(this), _descriptor);
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _descriptor);
        }
        bytes memory adHash = abi.encodePacked(
            msg.sender,
            _token,
            _descriptor,
            ad.deadline,
            _isCollectible,
            fillersByAd[_ad].length
        );
        fillersByAd[_ad].push(adHash);
        adsByHash[adHash] = Ad(
            msg.sender,
            _token,
            _descriptor,
            ad.deadline,
            _isCollectible,
            false,
            false
        );
    }

    /**
     * @dev Resolves an ad by selecting a filler.
     * @param _ad The ad to be resolved
     * @param _fillerAd The ad to fill the resolution
     */
    function resolveAd(bytes memory _ad, bytes memory _fillerAd) public {
        Ad memory ad = adsByHash[_ad];
        Ad memory fillerAd = adsByHash[_fillerAd];
        require(ad.poster == msg.sender, "Cannot resolve someone else's ad.");
        require(
            // solium-disable-next-line security/no-block-members
            !(ad.cancelled || ad.resolved) && !(fillerAd.cancelled || fillerAd.resolved) && ad.deadline > now,
            "Cannot fill expired ad."
        );
        bool adFilledByFillerAd;
        for (uint256 i = 0; i < fillersByAd[_ad].length; i++) {
            if (
                keccak256(abi.encodePacked(fillersByAd[_ad][i])) == keccak256(abi.encodePacked(_fillerAd))
            ) {
                adFilledByFillerAd = true;
                break;
            }
        }
        require(
            adFilledByFillerAd,
            "Cannot resolve to the filler of someone else's ad."
        );
        if (ad.isCollectible){
            IERC721(ad.token).safeTransferFrom(address(this), fillerAd.poster, ad.descriptor);
            if (fillerAd.isCollectible) {
                IERC721(fillerAd.token).safeTransferFrom(address(this), ad.poster, fillerAd.descriptor);
            } else {
                IERC20(fillerAd.token).transfer(ad.poster, fillerAd.descriptor);
            }
        } else {
            IERC20(ad.token).transfer(fillerAd.poster, ad.descriptor);
            if (fillerAd.isCollectible) {
                IERC721(fillerAd.token).safeTransferFrom(address(this), ad.poster, fillerAd.descriptor);
            } else {
                IERC20(fillerAd.token).transfer(ad.poster, fillerAd.descriptor);
            }
        }
        adsByHash[_ad].resolved = true;
        adsByHash[_fillerAd].resolved = true;
    }

    /**
     * @dev This function is called when:
     * 1. The poster of an ad wants to cancel that ad (and, subsequesntly, all fillers of that ad)
     * 2. The filler of an ad want to cancel that filling
     * 3. The frontend calls it to update all ads that are past their deadline
     */
    function cancelAd(bytes memory _ad) public {
        Ad memory ad = adsByHash[_ad];
        require(
            // solium-disable-next-line security/no-block-members
            (ad.deadline < now || ad.poster == msg.sender) &&
            !(ad.resolved || ad.cancelled),
            "Cannot cancel this ad."
        );
        if (fillersByAd[_ad].length > 0) {
            for (uint256 i = 0; i < fillersByAd[_ad].length; i++) {
                Ad memory fillerAd = adsByHash[fillersByAd[_ad][i]];
                if (fillerAd.isCollectible) {
                    IERC721(fillerAd.token).safeTransferFrom(address(this), fillerAd.poster, fillerAd.descriptor);
                } else {
                    IERC20(fillerAd.token).transfer(fillerAd.poster, fillerAd.descriptor);
                }
                adsByHash[fillersByAd[_ad][i]].cancelled = true;
            }
        }
        if (ad.isCollectible) {
            IERC721(ad.token).safeTransferFrom(address(this), ad.poster, ad.descriptor);
        } else {
            IERC20(ad.token).transfer(ad.poster, ad.descriptor);
        }
        adsByHash[_ad].cancelled = true;
    }

}