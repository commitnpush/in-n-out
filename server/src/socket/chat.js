import Room from "../models/room";
import Account from "../models/account";
import moment from "moment";

export default function(io) {
  let managerName = "";
  io.on("connection", socket => {
    //방 입장
    socket.on("room", async data => {
      //manager이름 얻기
      if (data.type) {
        managerName = data.username;
      } else {
        const account = await Account.findOne({ username: data.username });
        managerName = account.employee_info.manager;
      }

      //DB에서 방정보 가져오기
      const room = await Room.findOne({
        manager: managerName
      }).slice("messages", 15);

      //입장한 회원의 인덱스 구하기
      const memberIndex = room.members
        .map(v => v.username)
        .indexOf(data.username);

      //상태를 true(입장)으로 변경
      room.members[memberIndex].status = true;

      //DB에 저장
      room.save();

      //입장한 회원에게 방정보 전달
      socket.emit("room", room);

      //입장해 있는 회원들에게 새로운 memebers 보내주기
      io.sockets.in(managerName).emit("enter", room.members);

      //소켓 그룹핑
      socket.join(managerName);
    });

    //메세지 전송
    socket.on("send", async data => {
      const room = await Room.findOne({ manager: managerName });
      room.messages.unshift(data);
      io.sockets.in(managerName).emit("send", room.messages[0]);
      await room.save();
    });

    //퇴장
    socket.on("leave", async data => {
      //DB에서 방정보 가져오기
      const room = await Room.findOne({ manager: managerName });
      //입장한 회원의 인덱스 구하기
      const memberIndex = room.members.map(v => v.username).indexOf(data);
      //상태를 false(퇴장)으로 변경
      room.members[memberIndex].status = false;

      //저장
      room.save();

      //소켓 그룹핑 해제
      socket.leave(managerName);

      //입장해 있는 회원들에게 입장한사람의 이름 알려줘서 status변경하게 하기
      io.sockets.in(managerName).emit("leave", data);
      socket.disconnect(true);
    });

    //메세지 추가로딩
    socket.on("more", async data => {
      const room = await Room.findOne({
        manager: data.manager
      }).slice("messages", [data.index, 10]);
      socket.emit("more", room.messages);
    });
  });
}
