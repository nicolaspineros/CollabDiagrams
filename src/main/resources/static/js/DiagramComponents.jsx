/**
 * Clase del componente principal de la aplicación
 */
class DiagramComponents extends React.Component {
  constructor(props) {
    super(props);
    this.ids = [];
    /**
     * this.collabWS sera la representacion del socket
     */
    this.collabWS = new CollabConnection(CollabServiceURL(), (msg) => {
      var obj = JSON.parse(msg);
      console.log("On func call back ",obj);          
      //this.drawComponent(obj); 
      //console.log(obj.type);
      /**
       * segun el tipo de objeto se realiza la accion de añadir, eliminar o mover el elemento
       *  */     
      switch(obj.type){
        case 'shape.added':
            //console.log("SA");            
            this.drawShape(obj.element);
            break;
        case 'shape.removed':
            //console.log("SR");
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

    /**
     * this.bpmnViewer representa el modulo de bpmn
     */
    this.bpmnViewer = new BpmnJS({ container });

    /**
     * una vez se carga el modulo se obtiene el canvas a editar
     */
    this.bpmnViewer.on("import.done", (event) => {
      const { error, warnings } = event;

      if (error) {
        return this.handleError(error);
      }

      this.bpmnViewer.get("canvas").zoom("fit-viewport");

      return this.handleShown(warnings);
    });    

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

  /**
   * metodo que usa el modulo bpmn para identificar los cambios
   * envia los cambios al websocket
   */
  controlador(){    
    this.bpmnViewer.on('shape.added', (sa) => {    
          //console.log(this.ids);
          //console.log("SA",sa);
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

function ticketServiceURL() {
    var url = RESThostURL() + '/getticket';
    console.log("ticketService URL Calculada: " + url);
    return url;
}

// Retorna la url del servicio. Es una función de configuración.
function RESThostURL() {
    var host = window.location.host;
    var protocol = window.location.protocol;
    var url = protocol + '//' + (host);
    console.log("host URL Calculada: " + url);
    return url;
}

async function getTicket() {
    const response = await fetch(ticketServiceURL());
    console.log("ticket: " + response);
    return response;
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
  async onOpen(evt) {
    console.log("In onOpen", evt);
        var response = await getTicket();
        var json;
        if (response.ok) {
            // // if HTTP-status is 200-299
            // get the response body (the method explained below)
            json = await response.json();
        } else {
            console.log("HTTP-Error: " + response.status);
        }
    this.wsocket.send(json.ticket);
  }
  onMessage(evt) {
    console.log("In onMessage", evt);
    // Este if permite que el primer mensaje del servidor no se tenga en cuenta.
    // El primer mensaje solo confirma que se estableció la conexión.
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
