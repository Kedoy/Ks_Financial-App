import React from "react";
import ReceiptCatcherGame from "../components/ReceiptCatcherGame";

export default function Game() {
  return (
    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" , margin: "-100px auto"}}>
      <ReceiptCatcherGame />
    </div>
  );
}
