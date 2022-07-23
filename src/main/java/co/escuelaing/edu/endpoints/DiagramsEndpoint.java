package co.escuelaing.edu.endpoints;

import java.io.IOException;
import java.util.logging.Level;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Logger;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import co.escuelaing.edu.DiagramContext;
import co.escuelaing.edu.TicketRepository;

/**
 * Esta clase lleva el registro concurrente de las sesiones conectadas al websocket y los mensajes o errores
 */
@Component
@ServerEndpoint("/CollabService")
public class DiagramsEndpoint {
    private static final Logger logger = Logger.getLogger(DiagramsEndpoint.class.getName());
    
    static Queue<Session> queue = new ConcurrentLinkedQueue<>();

    TicketRepository ticketRepo = (TicketRepository) DiagramContext.getApplicationContext().getBean("ticketRepository");
    Session ownSession = null;
    private boolean accepted = false;

    /**
     * En este metodo verificamos que el mensaje que viaja por el socket no sea de nuestra propia sesion y se envia el mensaje
     * a todos los clientes conectados
     * @param msg
     */
    public void send(String msg) {
        try {
            for (Session session : queue) {
                if (!session.equals(this.ownSession)) {
                    session.getBasicRemote().sendText(msg);                    
                }
                System.out.println("BACK"+msg);
                logger.log(Level.INFO, "Sent: {0}", msg);
            }
        } catch (IOException e) {
            logger.log(Level.INFO, e.toString());
        }
    }

    /**
     * Metodo por donde viaja la informacion a los diferentes clientes
     * @param message los que se transmite por el canal del websocket
     * @param session la sesion que remite el mensaje
     */
    @OnMessage
    public void processDiagram(String message, Session session) {
        if (accepted) {
            System.out.println("Diagram received:" + message + ". From session: " +
                session);
            this.send(message);
        } else {
            if (!accepted && ticketRepo.checkTicket(message)) {
                accepted = true;
            }else{
                try {
                    ownSession.close();
                } catch (IOException ex) {
                    Logger.getLogger(DiagramsEndpoint.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        
    }

    /**
     * Registra la coneccion en la cola de sesiones
     * @param session El identificador de la sesion
     */
    @OnOpen
    public void openConnection(Session session) {        
        queue.add(session);
        ownSession = session;
        logger.log(Level.INFO, "Connection opened.");
        try {
            session.getBasicRemote().sendText("Connection established.");
        } catch (IOException ex) {
            logger.log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Cuando la sesion se cierra se elimina de la cola 
     * @param session sesion cerrada
     */
    @OnClose
    public void closedConnection(Session session) {        
        queue.remove(session);
        logger.log(Level.INFO, "Connection closed.");
    }

    /**
     * Si ocurre un error se cierra la sesion y se notifica el error
     * @param session sesion que fallo en la conexion al websocket
     * @param t
     */
    @OnError
    public void error(Session session, Throwable t) {
        queue.remove(session);
        logger.log(Level.INFO, t.toString());
        logger.log(Level.INFO, "Connection error.");
    }
}

