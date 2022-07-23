package co.escuelaing.edu.controllers;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import co.escuelaing.edu.TicketRepository;

@RestController
public class DiagramServiceController {

    @Inject
    TicketRepository ticketRepo;
    
    @GetMapping("/status")
    public String status(){
        return "{\"status\":\"Greetings from Spring Boot. " +
                java.time.LocalDate.now() + ", " +
                java.time.LocalTime.now() +
                ". " + "The server is Runnig!\"}";
    }

    @GetMapping("/getticket")
    public String getTicket() {
        return "{\"ticket\":\"" + ticketRepo.getTicket() + "\"}";
    }
}
