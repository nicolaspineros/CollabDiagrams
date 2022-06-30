import React from "react";
import ReactDOM from "react-dom";

import DiagramComponents from "./DiagramComponents";
 

ReactDOM.render(
    <React.StrictMode>
        <DiagramComponents 
        url="diagram.bpmn"
        onLoading={ onLoading }
        onShown={ onShown }
        onError={ onError }
        />
    </React.StrictMode>,
    document.getElementById("root")    
);