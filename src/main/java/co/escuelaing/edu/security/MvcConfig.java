package co.escuelaing.edu.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/diagram").setViewName("diagram");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("https://shielded-springs-57727.herokuapp.com/").setViewName("home");
        registry.addViewController("/login").setViewName("login");
    }

}

