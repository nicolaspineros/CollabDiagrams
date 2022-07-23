package co.escuelaing.edu.configurator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
//import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.session.data.redis.config.ConfigureRedisAction;

/**
 * Configuracion conexion a Redis
 */
@Configuration
@PropertySource("application.properties")
public class RedisConfig {

    @Value("${redis.bbcache.hostname}")
    private String redisHostName;
    @Value("${redis.bbcache.port}")
    private int redisPort;
    @Value("${redis.bbcache.pwd}")
    private String redisPwd;

    /**
     * Lectura configuracion de redis
     * @return la conexion establecida por los datos en application.properties
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisconf = new RedisStandaloneConfiguration(redisHostName, redisPort);
        redisconf.setPassword(redisPwd);
        LettuceConnectionFactory connectionFactory = new LettuceConnectionFactory(redisconf);
        return connectionFactory;
    }

}
