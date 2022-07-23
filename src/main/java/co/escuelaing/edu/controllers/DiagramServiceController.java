package co.escuelaing.edu.controllers;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import co.escuelaing.edu.TicketRepository;

/**
 * Controlador peticiones HTTP
 */
@RestController
public class DiagramServiceController {

    @Inject
    TicketRepository ticketRepo;
    
    /**
     * Metodo para confirmar que el servidor esta corriendo
     * @return estado del servidor
     */
    @GetMapping("/status")
    public String status(){
        return "{\"status\":\"Greetings from Spring Boot. " +
                java.time.LocalDate.now() + ", " +
                java.time.LocalTime.now() +
                ". " + "The server is Runnig!\"}";
    }

    /**
     * Metodo para obtener registro de tiquete 
     * @return ticket que identifica la sesion del usuario para el broker de mensajes
     */
    @GetMapping("/getticket")
    public String getTicket() {
        return "{\"ticket\":\"" + ticketRepo.getTicket() + "\"}";
    }
}
