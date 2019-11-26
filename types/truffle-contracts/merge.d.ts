/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

/// <reference types="truffle-typings" />

import * as TruffleContracts from ".";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(
        name: "DoubleLinkedList"
      ): TruffleContracts.DoubleLinkedListContract;
      require(name: "LinkedList"): TruffleContracts.LinkedListContract;
      require(name: "Migrations"): TruffleContracts.MigrationsContract;
      require(name: "RBAC"): TruffleContracts.RBACContract;
      require(
        name: "StringConversion"
      ): TruffleContracts.StringConversionContract;
    }
  }
}
