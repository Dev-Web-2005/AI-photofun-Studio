package service.identity.DTOs.response.fb;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class FbUserInfoResponse {
  String id;
  String name;
  String email;
  Picture picture;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Picture {
    PictureData data;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class PictureData {
    Integer height;
    Boolean isSilhouette;
    String url;
    Integer width;
  }
}
