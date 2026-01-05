package service.identity.utils;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import service.identity.configuration.CookieConfig;


@Component
@RequiredArgsConstructor
public class CookieUtils {

  private final CookieConfig cookieConfig;

  public ResponseCookie createJwtCookie(String token) {
    ResponseCookie.ResponseCookieBuilder builder =
        ResponseCookie.from("jwt", token)
            .httpOnly(true)
            .secure(cookieConfig.isSecure())
            .path("/")
            .maxAge(Duration.ofDays(1));

    String sameSite = cookieConfig.getSameSite();
    if (StringUtils.hasText(sameSite)) {
      builder.sameSite(sameSite);
    }

    String domain = cookieConfig.getDomain();
    if (StringUtils.hasText(domain) && !domain.isBlank()) {
      builder.domain(domain);
    }

    return builder.build();
  }

  public ResponseCookie createExpiredJwtCookie() {
    ResponseCookie.ResponseCookieBuilder builder =
        ResponseCookie.from("jwt", "")
            .httpOnly(true)
            .secure(cookieConfig.isSecure())
            .path("/")
            .maxAge(0);

    String sameSite = cookieConfig.getSameSite();
    if (StringUtils.hasText(sameSite)) {
      builder.sameSite(sameSite);
    }

    String domain = cookieConfig.getDomain();
    if (StringUtils.hasText(domain) && !domain.isBlank()) {
      builder.domain(domain);
    }

    return builder.build();
  }
}
