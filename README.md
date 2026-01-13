# AI photofun studio

## Hướng dẫn Demo và Phân công Nhiệm vụ

- Luôn cập nhất version final mới nhất trên nhóm nếu có sự thay đổi và chủ động test
- Mọi người đọc kỹ template của mình (phân ra xem nó có những nội dung gì)
- [TASK] Dựa vào template của từng người đọc và lựa ra xem mình đảm nhiệm phần nào trong ( plan, sdp, vision document, use case spec, UI prototype, reports ...) báo lên nhóm mình có phần nào
- [TASK] Đọc về một vài câu hỏi nghiệp vụ liên quan template của mình và phần code mình triển khai, ghi ra note gửi lên nhóm -- các thành viên còn lại chịu trách nhiệm tiếp thu và support cho người trả lời chính
- Dựa vào cách triển khai, và xem xét dưới gốc độ cá nhân chủ quan của tui thì tui định sẽ phân ra flow để demo như sau

  - Cả 5 người sẽ run code ở local để minh chứng thầy xem
  - Xin thầy có sản phẩm deploy thì cho nhóm test tren sản phảm deploy để có trải nghiệm thực hơn được không (thì lúc này cả 5 người sẽ tương tác như đang xử dụng mạng xã hội)
  - Nếu test UI thì [TÝ] [THỊNH] sẽ chịu trách nhiệm phần test tất cả UI social (vì frontend sẽ ít có logic nghiệp vụ sau nên là sẽ chủ yếu test UI để có hỏi UI thì sẽ chủ động trả lời)
    ++ Register
    ++ Login
    ++ Social Login - chỉ dùng google
    ++ Premium account
    ++ comment
    ++ like
    ++ Vô xem profile
    ++ Tạo group -- group name = vấn đáp
    ++ Join vào groups name = vấn đáp -- groups này tới đó tui sẽ nhờ người tạo trước
    ++ Nhắn tin (vẫn ưu tiên gửi ảnh, video, message rồi mới tới emoji)
    ++ Sử dụng prompt có sẵn của các bài post
    ++ Chỉ nói về chức năng audio call, video call xong hỏi thầy có cần test không nếu cần mới làm với một bạn khác còn không skip qua
    -> 2 Người tự lên kế hoạch để có flow mượt nhất nha tránh mất thời gian demo -- sau đó sẽ call nói cho em cái flow của mấy thầy, đặc biệt phải ưu tiên cái premium account trước
    tức là 2 người ban đầu sẽ là account thường sau đó có 1 người upgrade lên premium thì sẽ test tới chức năng tạo group, tạo groups (vấn đáp) sau đó người còn lại dùng acc regular để request vô
    sau đó người kia accept cho vô rồi test tiếp
    -> phải có 1 người account login bình thường và 1 account login google nha

  - Nếu test chức năng AI:
    ++ [ĐẾ] chịu trách nhiệm test các chức năng về image -> kể cả share lên groups, share feed, download -> lúc đang test về tạo groups thì phải join vào group vấn đáp luôn
    ++ [TRƯỜNG] chịu trách nhiệm test các chức năng về video -> tương tự như Đế
    ++ Cả 2 phải dùng account premium để có thể tối đa trãi nghiệm test
  - Lưu ý phải cố gắng xin test được bằng production nếu không test localhost thì nó sẽ không có độ continous phải reload liên tục để fetch DB lại mới có giá trị
  - Lưu ý là đồ án đang ưu tiên chức năng AI vì thế phải test cho được hết chức năng AI cho dù khong test được hết social
  - Social test tới register, login, premium, tạo group, join group, thì lúc này AI sẽ lên test chức năng AI (nhớ phải join vô group vấn đáp và người bên social cần accept) khi test hết rồi
    sẽ tới social test tiếp mấy chức năng còn lại nếu cảm thấy không kịp thì mình sẽ kể, còn nếu thầy không nói gì thì cứ tiếp tục

  - Có chức năng bảo vệ nội dung nhưng mình sẽ không test vì nó thô quá -- sẽ là điểm trừ, chỉ cần nói là có chức năng [THỊNH] chịu trách nhiệm chức năng này của thầy
  - Khi những người demo thì những người sau phải hỗ trợ nhắc xem còn gì không, hay tới gì, hay phải diễn giải tiếp người đang test cho thầy, nhất là lúc AI test gen ảnh mọi người cũng gen để có gì lâu quá còn có người khác show ra cho thầy xem
  - Khi hỏi câu hỏi ai biết nhiều trả lời nhiều, phần nào của mình chủ động lên tiếng trả lời, những người còn lại hỗ trợ

  -> Deadline 13/1 báo cáo lại và phải tự trách nhiệm đọc hết, tui soạn cũng mất thời gian nên vì thế đừng tiếc vài phút đọc

## Hướng dẫn chạy

- Lần đầu chạy theo hướng dẫn (chỉ chạy 1 làn duy nhất từ lần 2 không cần chạy) docker network create shared-local-network

- cd src/backend
- cd backendSocial; docker-compose -f docker-compose-local.yml up -d; cd ..
- cd backendAI; docker-compose -f docker-composr-local.yml up -d; cd ..
- cd ../frontend; npm i; npm run dev

## Các lưu ý

- Tuyệt đối không sửa code giai đoạn này
- Tuyệt đối không đụng vào các file khác chỉ cần quan tâm cách chạy
- Có thay đổi gì phải thông báo với tui duyệt xem có cần thiết và an toàn không
- CÒn lại theo dõi thông tin nhóm và thực hiện đầy đủ yêu cầu trên
