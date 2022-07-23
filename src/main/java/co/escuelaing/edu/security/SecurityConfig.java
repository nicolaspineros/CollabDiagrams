package co.escuelaing.edu.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

/**
 * Clase de configuracion de seguridad de usuarios y de rutas autorizadas
 */

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/", "/diagramCollab").permitAll()
                .anyRequest().authenticated()
                .and()
            .formLogin()
                .loginPage("/login")
                .permitAll()
                .and()
            .logout()
                .permitAll();              
                
    }   

    /**
     * Metodo de asignación de nombre de usuario y contraseña
     * @return el o los usuarios registrados
     */
    @Bean
    @Override
    public UserDetailsService userDetailsService() {
        List<UserDetails> users = new ArrayList<>();
        UserDetails user =
                User.withDefaultPasswordEncoder()
                        .username("nicolas")
                        .password("admin")
                        .roles("USER")
                        .build();
        users.add(user);

        UserDetails user2 =
                User.withDefaultPasswordEncoder()
                        .username("daniel")
                        .password("user2")
                        .roles("USER")
                        .build();

        users.add(user2);

        UserDetails user3 =
                User.withDefaultPasswordEncoder()
                        .username("juan")
                        .password("user3")
                        .roles("USER")
                        .build();

        users.add(user3);

        return new InMemoryUserDetailsManager(users);
    }
}
