package co.escuelaing.edu.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Esta clase configura el nombre de las rutas para los archivos templates y el archivo raiz
 */
@Configuration
public class MvcConfig implements WebMvcConfigurer {

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/diagramCollab").setViewName("diagramCollab");
        registry.addViewController("/").setViewName("Home");
        registry.addViewController("/panel").setViewName("panel");
        registry.addViewController("/login").setViewName("login");
    }

}

