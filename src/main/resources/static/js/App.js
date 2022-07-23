import React from "react";
import ReactDOM from "react-dom";

import DiagramComponents from "./DiagramComponents";
 

ReactDOM.render(
    <React.StrictMode>
        <DiagramComponents 
        url="diagram.bpmn"
        />
    </React.StrictMode>,
    document.getElementById("root")    
);