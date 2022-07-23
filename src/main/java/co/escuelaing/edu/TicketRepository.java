package co.escuelaing.edu;

import javax.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Clase encargada de la creacion y validacion de los tickets
 */
@Component
public class TicketRepository {

    @Autowired
    private StringRedisTemplate template;
    // inject the template as ListOperations
    @Resource(name = "stringRedisTemplate")
    private ListOperations<String, String> listTickets;
    private int ticketnumber;

    /**
     * Constructor
     */
    public TicketRepository() {
    }

    /**
     * Metodo que genera ticket unico por conexión
     * @return ticket generado
     */
    public synchronized Integer getTicket() {
        Integer a = ticketnumber++;
        listTickets.leftPush("ticketStore", a.toString());
        return a;
    }

    /**
     * Metodo verificacion de ticket
     * @param ticket registro a validar
     * @return valor booleano true si el ticket se encuentra
     */
    public boolean checkTicket(String ticket) {
        Long isValid = listTickets.getOperations().boundListOps("ticketStore").remove(0, ticket);
        return (isValid > 0l);
    }

    private void eviction() {
        // Delete tickets after timout or include this functionality in checkticket
    }
}
