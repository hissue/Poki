import { Fragment, useState, useCallback, useEffect } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  Cog6ToothIcon,
  HomeIcon,
  XMarkIcon,
  GiftIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { connectUserCode, getConnectedUser } from "../../api/auth.js";
import SuccessModal from "../../components/Modal/SuccessModal";
import FailModal from "../../components/Modal/FailModal";
import grapeLogo from "../../icons/mstile-310x310.png";
import PodoChar from "../../icons/PodoChar.png";

// ======================================
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { userState } from "../../recoil/user";
import { socket } from "../../App";
import ChatRoom from "./ChattingRoom.jsx";
import BottomButton from "../General/BottomButton";

const queryClient = new QueryClient();

const navigation = [
  { name: "홈", href: "/format/child", icon: HomeIcon, current: false },
  {
    name: "위시리스트",
    href: "/format/child/wishlist",
    icon: GiftIcon,
    current: false,
  },
  {
    name: "화상통화",
    href: "/format/child/video",
    icon: VideoCameraIcon,
    current: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ChildFormat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputData, setInputData] = useState("");
  const [inputReadOnly, setInputReadOnly] = useState(false);
  const [registCodeModal, setRegistCodeModal] = useState(false);
  const [registCodeFailModal, setRegistCodeFailModal] = useState(false);
  const [failModal, setFailModal] = useState(false);

  const openRegistCodeModal = () => {
    setRegistCodeModal(true);
  };

  const closeRegistCodeModal = () => {
    setRegistCodeModal(false);
  };

  const openFailModal = () => {
    setFailModal(true);
  };

  const closeFailModal = () => {
    setFailModal(false);
  };

  const openCodeFailModal = () => {
    setRegistCodeFailModal(true);
  };

  const closeCodeFailModal = () => {
    setRegistCodeFailModal(false);
  };

  // recoil
  const user = useRecoilValue(userState);

  const handleInputChange = (e) => {
    setInputData(e.target.value);
  };

  const handleRegistCode = async () => {
    console.log("handleRegistCode");
    if (inputData !== "") {
      const params = {
        request: {
          child_id: user.user_id,
          connection_code: inputData,
        },
      };
      const flag = await connectUserCode(params);
      console.log(flag.connected);
      if (flag.connected === true) {
        console.log("성공");
        setInputReadOnly(flag.connected);
        openRegistCodeModal();
      } else {
        console.log("입력 코드가 틀렸다는 모달 나와야함");
        // 입력 코드가 틀렸다는 모달 나와야함
        openCodeFailModal();
      }
    } else {
      console.log("입력값이 없다는 모달 나와야함");
      // 입력값이 없다는 모달 나와야함
      openFailModal();
    }
  };

  // ==================================================================
  const navigate = useNavigate();

  // 채팅방이 없을 시 채팅 아이콘 클릭시 이 함수 호출
  const onCreateRoom = useCallback(() => {
    const roomName = `${user.user_id}'s_room`;
    socket.emit("create-room", { roomName, user }, (response) => {
      if (response.number === 2) {
        socket.emit("join-room", response.payload, () => {
          navigate(`/chat/${response.payload}`);
        }); // 이미 채팅방이 존재할 경우 바로 입장
      }
      if (response.number === 0) return alert(response.payload);
      navigate(`/chat/${response.payload}`);
    });
  }, [navigate]);

  // 코드 존재 여부 확인 (수정 필요)
  const [isConnect, setIsConnect] = useState("");
  const isConnected = async () => {
    try {
      const state = await getConnectedUser();
      // console.log(state);
      setIsConnect(state.data.is_connected);
    } catch (error) {
      console.log("Failed to get connected status:", error);
    }
  };

  useEffect(() => {
    isConnected();
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="h-[10%] bg-white border-gray-400 shadow-sm flex justify-end relative">
          <div className="border-b absolute bottom-0 left-0 right-0"></div>
          <img
            className="rounded-full m-4 w-11 h-11 border-2 rounded-2"
            src={PodoChar}
            alt=""
          />
        </div>
        <div className="h-[80%] bg-white">
          <ChatRoom />
        </div>
        <div className="h-[10%]">
          <BottomButton />
        </div>
      </div>
    </>
  );
}
