class DiagramComponents extends React.Component {
  constructor(props) {
    super(props);
    this.collabWS = new CollabConnection(CollabServiceURL(), (msg) => {
      //var obj = JSON.parse(msg);
      console.log("On func call back ", msg);
      this.displayDiagram(msg);      
    });
    this.state = {};
    console.log(this.state);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const { url, diagramXML } = this.props;    

    const container = this.containerRef.current;

    this.bpmnViewer = new BpmnJS({ container });

    /*let element = bpmnViewer;
    this.eventBus = this.bpmnJS.get("eventBus");
    this.eventBus.on("element.click", function(event) {
    element = {
        id: event.element.id,
        type: event.element.type
    }
    console.log(element);
    });

    const MyLoggingPlugin = (eventBus) => {
        eventBus.on('element.changed', (event) => {
          console.log('element ', event.element, ' changed');
        });
      }
    */

    this.bpmnViewer.on("import.done", (event) => {
      const { error, warnings } = event;

      if (error) {
        return this.handleError(error);
      }

      this.bpmnViewer.get("canvas").zoom("fit-viewport");

      return this.handleShown(warnings);
    });

    this.eventBus = this.bpmnViewer.get("eventBus");
    console.log("Bus: "+this.eventBus);
    this.eventBus.on("element.click", (event) => {
        console.log(event.element);
    })

    if (url) {
        console.log("Paso url");
      return this.fetchDiagram(url);
    }

    if (diagramXML) {
        console.log("Paso diagramXML");
      return this.displayDiagram(diagramXML);
    }
  }

  componentWillUnmount() {
    this.bpmnViewer.destroy();
  }

  componentDidUpdate(prevProps, prevState) {
    const { props, state } = this;    
    if (props.url !== prevProps.url) {
      console.log("UPDATEurl" + currentXML);
      this.collabWS.send(props.url);
      return this.fetchDiagram(props.url);
    }

    const currentXML = props.diagramXML || state.diagramXML;

    const previousXML = prevProps.diagramXML || prevState.diagramXML;

    console.log("previousXMl" + previousXML);
    console.log("currentProps" + props.diagramXML);
    console.log("prevState" + state.diagramXML);

    if (currentXML && currentXML !== previousXML) {
      console.log("UPDATE component" + currentXML);
      this.collabWS.send(currentXML);
      return this.displayDiagram(currentXML);
    }
  }

  displayDiagram(diagramXML) {
    //this.collabWS.send(diagramXML);
    console.log("Uso displayDiagram")
    this.bpmnViewer.importXML(diagramXML);
  }

  fetchDiagram(url) {
    this.handleLoading();

    fetch(url)
      .then((response) => response.text())
      .then((text) => this.setState({ diagramXML: text }))
      .catch((err) => this.handleError(err));

    console.log("uso fetch"+url);
  }

  handleLoading() {
    const { onLoading } = this.props;

    if (onLoading) {
      onLoading();
    }
  }

  handleError(err) {
    const { onError } = this.props;

    if (onError) {
      onError(err);
    }
  }

  handleShown(warnings) {
    const { onShown } = this.props;

    if (onShown) {
      onShown(warnings);
    }
  }

  render() {
    return (
      <div
        className="react-bpmn-diagram-container"
        ref={this.containerRef}
      ></div>
    );
  }
}

function CollabServiceURL() {
  var host = window.location.host;
  var url = "ws://" + host + "/CollabService";
  console.log("URL Calculada: " + url);
  return url;
}

class CollabConnection {
  constructor(URL, callback) {
    this.URL = URL;
    this.wsocket = new WebSocket(URL);
    this.wsocket.onopen = (evt) => this.onOpen(evt);
    this.wsocket.onmessage = (evt) => this.onMessage(evt);
    this.wsocket.onerror = (evt) => this.onError(evt);
    this.receivef = callback;
  }
  onOpen(evt) {
    console.log("In onOpen", evt);
  }
  onMessage(evt) {
    console.log("In onMessage", evt);
    if (evt.data != "Connection established.") {
      console.log("onmessage" + evt.data);
      this.receivef(evt.data);
    }
  }
  onError(evt) {
    console.error("In onError", evt);
  }
  send(diagram) {
    let msg = diagram;
    console.log("sending: ", msg);
    this.wsocket.send(msg);
  }
}

/*
class MyCustomPlugin {
	
	addIfNotExist (definition, varName, varDefault){
		if(!definition.entries)
			definition.entries = [];
		
		var entryExists = definition.entries.find( (item) => {return item.key === varName});
		
		if( !entryExists){
			var moddleParams = {key: varName, $body: varDefault};
			var newParameter = this.moddle.createAny('camunda:entry', 'http://camunda.org/schema/1.0/bpmn', moddleParams);
			definition.get("entries").push(newParameter);
		}
	};
	
	getDoParameter(element){
		try{
			if(element.type === "bpmn:UserTask"){

				var extensions = element.businessObject.extensionElements;
				if(extensions && extensions.values){					
					var inputOutputs = extensions.values.find((v) => { return v.$type === "camunda:InputOutput"; });

					if(inputOutputs && inputOutputs.inputParameters){
						var inputParameters = inputOutputs.inputParameters;
						
						var doParameter = inputParameters.find((i) => {return i.name === "DO"});
						if(doParameter && doParameter.definition && doParameter.definition.$type === "camunda:Map"){
							return doParameter;
						}
					}
				}
			}
		}catch(e){
			console.log(e);
		}
		return null;
	}

	constructor(eventBus, moddle) {
		this.eventBus = eventBus;
		this.moddle = moddle;

		eventBus.on('propertiesPanel.changed', (event) => {
			try{
				var currentElement = event.current.element;
				var doParameter = this.getDoParameter(currentElement);
				if(doParameter){
					// this is where I add new fields to map and fire the event
					this.addIfNotExist(doParameter.definition, "isNextStepAsync", "false");
					this.addIfNotExist(doParameter.definition, "textMessage", "");
					this.addIfNotExist(doParameter.definition, "pageHeader", "");
					this.addIfNotExist(doParameter.definition, "textType", "");
					this.eventBus.fire('commandStack.changed', {element: currentElement});
				}
			}catch(e){
				console.log(e);
			}
		});
	}
}

MyCustomPlugin.$inject = [ 'eventBus' , 'moddle', 'canvas', 'commandStack']; 

export default {
  __init__: [ 'MyCustomPlugin' ],
  MyCustomPlugin: [ 'type', MyCustomPlugin ]
};
*/

ReactDOM.render(
  <DiagramComponents url="js/diagram.bpmn" />,
  document.getElementById("root")
);
