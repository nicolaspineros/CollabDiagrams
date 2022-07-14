class DiagramComponents extends React.Component {
  constructor(props) {
    super(props);
    this.collabWS = new CollabConnection(CollabServiceURL(), (msg) => {
      //var obj = JSON.parse(msg);
      console.log("On func call back ", msg);
      this.displayDiagram(msg);
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

ReactDOM.render(
  <DiagramComponents url="js/diagram.bpmn" />,
  document.getElementById("root")
);
