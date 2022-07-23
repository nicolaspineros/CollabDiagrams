package co.escuelaing.edu;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Clase que contiene el fichero de los objetos que se añaden a la aplicacion
 */
@Component
@Lazy(false)
public class DiagramContext implements ApplicationContextAware {
    private static ApplicationContext APPLICATION_CONTEXT;
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        APPLICATION_CONTEXT = applicationContext;
    }
    public static ApplicationContext getApplicationContext() {
        return APPLICATION_CONTEXT;
    }
}