class DiagramComponents extends React.Component {
  constructor(props) {
    super(props);
    this.collabWS = new CollabConnection(CollabServiceURL(), (msg) => {
      //var obj = JSON.parse(msg);
      console.log("On func call back ",msg);
      console.log(msg.x);      
      //this.drawComponent(obj.type,obj.x,obj.y,obj.id);                 
    });
    this.state = {};
    console.log(this.state);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const { url, diagramXML } = this.props;    

    const container = this.containerRef.current;

    this.bpmnViewer = new BpmnJS({ container });

    this.bpmnViewer.on("import.done", (event) => {
      const { error, warnings } = event;

      if (error) {
        return this.handleError(error);
      }

      this.bpmnViewer.get("canvas").zoom("fit-viewport");

      return this.handleShown(warnings);
    });    

    this.controladorEventos();

    if (url) {        
      return this.fetchDiagram(url);
    }

    if (diagramXML) {        
      return this.displayDiagram(diagramXML);
    }
    
  }

  componentWillUnmount() {
    this.bpmnViewer.destroy();
  }

  componentDidUpdate(prevProps, prevState) {
    const { props, state } = this;    
    if (props.url !== prevProps.url) {            
      return this.fetchDiagram(props.url);
    }

    const currentXML = props.diagramXML || state.diagramXML;

    const previousXML = prevProps.diagramXML || prevState.diagramXML;

    if (currentXML && currentXML !== previousXML) {               
      return this.displayDiagram(currentXML);
    }
  }

  controladorEventos(){
    /* this.eventBus = this.bpmnViewer.get("eventBus");
    console.log("Bus: "+this.eventBus);
    var events = [      
      'element.click',
      'element.dblclick',
      'element.mousedown',
      'element.mouseup'
    ]; */

    this.bpmnViewer.on('selection.changed', (e) => {
        console.log(e);        
        if(e.newSelection[0] != undefined){
            console.log(e.newSelection[0]);            
            let element = {
                id: e.newSelection[0].id,
                type: e.newSelection[0].type,
                x: e.newSelection[0].x,
                y: e.newSelection[0].y
            }
            this.collabWS.send(element);
        }        
    });
    /*
    this.eventBus.on(events, (event) => {
        console.log(event.element);        
        console.log(event.element.x);
        console.log(event.element.type);
        this.collabWS.send(event.element);
    })
*/
  }

  drawComponent(id,type,x,y){  
    console.log("Draw Component");
    console.log(id)    
    console.log(type);
    console.log(x);
    console.log(y);
    const bpmnFactory = this.bpmnViewer.get('bpmnFactory'),
          elementFactory = this.bpmnViewer.get('elementFactory'),
          elementRegistry = this.bpmnViewer.get('elementRegistry'),
          modeling = this.bpmnViewer.get('modeling');
    
    /* const attrs = {
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:TimerEventDefinition'
    };

    const position = {
        x: component.element.x + component.element.width,
        y: component.element.y + component.element.height
      };

    modeling.createShape(attrs, position, component, { attach: true });
         */
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
      console.log("onmessage", evt.data);
      this.receivef(evt.data);
    }
  }
  onError(evt) {
    console.error("In onError", evt);
  }
  send(element) {
    //let msg = '{ "id":' + (element.id) + ',"type":' + (element.type) + ',"x":' + (element.x) + ',"y": ' + (element.y) +"}";
    let msg = element;
    console.log("sending: ", msg);
    this.wsocket.send(msg);
  }
}


ReactDOM.render(
  <DiagramComponents url="js/diagram.bpmn" />,
  document.getElementById("root")
);
