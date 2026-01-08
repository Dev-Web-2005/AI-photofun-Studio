package service.identity.repository.http;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import service.identity.DTOs.response.fb.FbTokenResponse;
import service.identity.DTOs.response.fb.FbUserInfoResponse;

@FeignClient(name = "fb-client", url = "https://graph.facebook.com")
public interface FbClient {
  @GetMapping(value = "/v17.0/oauth/access_token")
  FbTokenResponse
  getAccessToken(@RequestParam("client_id") String clientId,
                 @RequestParam("redirect_uri") String redirectUri,
                 @RequestParam("client_secret") String clientSecret,
                 @RequestParam("code") String code);

  @GetMapping(value = "/v17.0/me")
  FbUserInfoResponse
  getUserInfo(@RequestParam("fields") String fields,
              @RequestParam("access_token") String accessToken);
}
