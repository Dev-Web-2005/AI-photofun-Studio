package service.identity.DTOs.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
  @NotBlank(message = "EMAIL_REQUIRED")
  @Email(message = "Invalid email format")
  String email;
}
