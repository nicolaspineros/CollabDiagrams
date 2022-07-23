class DiagramComponents extends React.Component {
  constructor(props) {
    super(props);
    this.ids = [];
    this.collabWS = new CollabConnection(CollabServiceURL(), (msg) => {
      var obj = JSON.parse(msg);
      console.log("On func call back ",obj);          
      //this.drawComponent(obj); 
      console.log(obj.type);      
      switch(obj.type){
        case 'shape.added':
            console.log("SA");            
            this.drawShape(obj.element);
            break;
        case 'shape.removed':
            console.log("SR");
            this.delete(obj.element)
            break;
        case 'shape.move.end':
            console.log("SME");
            break;
        default:
            console.log("NA");
      }              
    });
    this.state = {};    
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

    //this.controladorEventos();
    this.controlador();
    
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

  controlador(){    
    this.bpmnViewer.on('shape.added', (sa) => {    
          console.log(this.ids);
          console.log("SA",sa);
          if(!this.ids.includes(sa.element.id)){
            this.collabWS.send(sa);
          }                   
    })
    this.bpmnViewer.on('shape.removed', (sr) => {
        console.log("SR",sr);
        this.collabWS.send(sr);
    })
    this.bpmnViewer.on('shape.move.start', (sms) => {
        console.log("sms",sms);
    })
    this.bpmnViewer.on('shape.move.end', (sme) => {
        console.log("SME",sme);        
        this.collabWS.send(sme);
    })

  }

  drawShape(obj){
    const bpmnFactory = this.bpmnViewer.get('bpmnFactory'),
        elementFactory = this.bpmnViewer.get('elementFactory'),
        elementRegistry = this.bpmnViewer.get('elementRegistry'),
        modeling = this.bpmnViewer.get('modeling'),
        process = elementRegistry.get('Process_0sckl64');

    const position = {
        x: obj.x + obj.height/2,
        y: obj.y + obj.width/2
    }; 

    var componentType = obj.type;
    
    const task = elementFactory.createShape({ type: componentType,
                                                id: obj.id});
    modeling.createShape(task,position,process);
    this.ids.push(obj.id);

  }

  delete(obj){
    var elementRegistry = this.bpmnViewer.get('elementRegistry'),
    modeling = this.bpmnViewer.get('modeling');

    var element = elementRegistry.get(obj.id);

    modeling.removeElements([ element ]);
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
            console.log(e.oldSelection[0]);            
            let element = {
                id: e.newSelection[0].id,
                type: e.newSelection[0].type,
                x: e.newSelection[0].x,
                y: e.newSelection[0].y,
                height: e.newSelection[0].height,
                width: e.newSelection[0].width
            }
            this.collabWS.send(element);
        }        
    });

  }

  drawComponent(component){  
    console.log("Draw Component");
    console.log(component.id)    
    console.log(component.type);
    console.log(component.x);
    console.log(component.y);
    console.log(component.height);
    console.log(component.width);
    const bpmnFactory = this.bpmnViewer.get('bpmnFactory'),
          elementFactory = this.bpmnViewer.get('elementFactory'),
          elementRegistry = this.bpmnViewer.get('elementRegistry'),
          modeling = this.bpmnViewer.get('modeling');

    const process = elementRegistry.get('Process_0sckl64');
    var startEvent = elementRegistry.get('StartEvent_1');    
    
    const position = {
        x: component.x + component.height/2,
        y: component.y + component.width/2
    }; 

    var componentType = component.type;

    console.log(componentType);

    const serviceTask = elementFactory.createShape({ type: componentType });

    modeling.appendShape(startEvent,serviceTask, position, process);
    
    //const boundaryEvent = elementFactory.createShape({ type: 'bpmn:BoundaryEvent' });
    
    modeling.createShape(componentType,position, serviceTask);

    startEvent = serviceTask;
            
  }


  displayDiagram(diagramXML) {        
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
        ref={this.containerRef}>
          
      </div>
      
    );
  }
}

function CollabServiceURL() {
    var host = window.location.host;
    var url = 'wss://' + (host) + '/CollabService';    
    console.log("host URL Calculada: " + url);
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
    let msg = JSON.stringify(element);    
    console.log("sending: ", msg);
    this.wsocket.send(msg);
  }
}


ReactDOM.render(    
    <DiagramComponents url="js/diagram.bpmn" />,
  document.getElementById("root")
);
