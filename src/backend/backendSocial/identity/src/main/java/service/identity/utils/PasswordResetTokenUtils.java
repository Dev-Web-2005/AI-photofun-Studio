package service.identity.utils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.PostConstruct;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import service.identity.exception.AppException;
import service.identity.exception.ErrorCode;

@Component
@Slf4j
public class PasswordResetTokenUtils {

  private RSAPrivateKey privateKey;
  private RSAPublicKey publicKey;

  private static final long TOKEN_EXPIRATION_MINUTES = 5;

  private static final String CLAIM_EMAIL = "email";
  private static final String CLAIM_USER_ID = "userId";
  private static final String CLAIM_PURPOSE = "purpose";
  private static final String PURPOSE_PASSWORD_RESET = "password_reset";

  @PostConstruct
  public void init() {
    try {

      KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
      keyPairGenerator.initialize(2048);
      KeyPair keyPair = keyPairGenerator.generateKeyPair();

      this.privateKey = (RSAPrivateKey)keyPair.getPrivate();
      this.publicKey = (RSAPublicKey)keyPair.getPublic();

      log.info("RSA key pair generated successfully for password reset tokens");
    } catch (Exception e) {
      log.error("Failed to generate RSA key pair: {}", e.getMessage());
      throw new RuntimeException(
          "Failed to initialize RSA keys for password reset", e);
    }
  }

  public String generatePasswordResetToken(String userId, String email) {
    try {

      JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                             .type(JOSEObjectType.JWT)
                             .build();

      JWTClaimsSet claimsSet =
          new JWTClaimsSet.Builder()
              .subject(userId)
              .issuer("AI-PhotoFun-Studio")
              .audience("password-reset")
              .jwtID(UUID.randomUUID().toString())
              .issueTime(Date.from(Instant.now()))
              .expirationTime(Date.from(Instant.now().plus(
                  TOKEN_EXPIRATION_MINUTES, ChronoUnit.MINUTES)))
              .claim(CLAIM_EMAIL, email)
              .claim(CLAIM_USER_ID, userId)
              .claim(CLAIM_PURPOSE, PURPOSE_PASSWORD_RESET)
              .build();

      SignedJWT signedJWT = new SignedJWT(header, claimsSet);
      RSASSASigner signer = new RSASSASigner(privateKey);
      signedJWT.sign(signer);

      String token = signedJWT.serialize();
      log.info("Generated password reset token for user: {}", userId);

      return token;
    } catch (JOSEException e) {
      log.error("Failed to generate password reset token: {}", e.getMessage());
      throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  public PasswordResetTokenData validatePasswordResetToken(String token) {
    try {
      SignedJWT signedJWT = SignedJWT.parse(token);

      RSASSAVerifier verifier = new RSASSAVerifier(publicKey);
      if (!signedJWT.verify(verifier)) {
        log.warn("Invalid signature for password reset token");
        throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
      }
      JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

      Date expirationTime = claims.getExpirationTime();
      if (expirationTime == null ||
          Instant.now().isAfter(expirationTime.toInstant())) {
        log.warn("Password reset token has expired");
        throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
      }
      String purpose = claims.getStringClaim(CLAIM_PURPOSE);
      if (!PURPOSE_PASSWORD_RESET.equals(purpose)) {
        log.warn("Invalid purpose claim in password reset token");
        throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
      }

      if (!claims.getAudience().contains("password-reset")) {
        log.warn("Invalid audience in password reset token");
        throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
      }

      String userId = claims.getSubject();
      String email = claims.getStringClaim(CLAIM_EMAIL);

      if (userId == null || email == null) {
        log.warn("Missing required claims in password reset token");
        throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
      }

      log.info("Successfully validated password reset token for user: {}",
               userId);

      return new PasswordResetTokenData(userId, email);

    } catch (AppException e) {
      throw e;
    } catch (java.text.ParseException e) {
      log.error("Failed to parse password reset token: {}", e.getMessage());
      throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
    } catch (JOSEException e) {
      log.error("Failed to verify password reset token: {}", e.getMessage());
      throw new AppException(ErrorCode.PASSWORD_RESET_TOKEN_INVALID);
    }
  }

  public static class PasswordResetTokenData {
    private final String userId;
    private final String email;

    public PasswordResetTokenData(String userId, String email) {
      this.userId = userId;
      this.email = email;
    }

    public String getUserId() { return userId; }

    public String getEmail() { return email; }
  }
}
