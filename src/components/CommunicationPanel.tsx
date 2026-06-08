import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Send, 
  Search, 
  User as UserIcon, 
  Clock, 
  Check, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  ShieldAlert
} from "lucide-react";

interface GymMessage {
  id: number;
  memberId: number;
  memberName: string;
  senderId: string;
  senderName: string;
  senderRole: "MEMBER" | "STAFF" | "ADMIN" | "PT";
  text: string;
  createdAt: string;
}

interface Member {
  id: number;
  memberCode: string;
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
  status: string;
  deletedAt?: string;
}

interface CommunicationPanelProps {
  user: {
    id: number;
    username?: string;
    fullName: string;
    role: "MEMBER" | "STAFF" | "ADMIN" | "PT" | "RECEPTIONIST";
    avatar?: string;
  };
  lang?: string;
  t?: (key: string) => string;
  activeMemberId?: number | null;
  setActiveMemberId?: (id: number | null) => void;
  isMobile?: boolean;
}

const commTranslations: Record<string, Record<string, any>> = {
  vi: {
    customerCorrespondence: "Kênh Giao Tiếp & Hỗ Trợ Hội Viên",
    activeConnection: "LIVE_SERVER_CONNECTED",
    refreshTooltip: "Làm mới hộp thoại",
    loadingMailbox: "Đang tải hộp thư giao tiếp...",
    supportHelpdesk: "BAN QUẢN LÝ & LỄ TÂN HỖ TRỢ",
    onlineTag: "Hỗ trợ trực tuyến 24/7",
    emptyMailboxTitle: "Hộp Thư Giao Tiếp Trống",
    emptyMailboxDesc: "Bạn chưa gửi tin nhắn hỗ trợ nào tới Ban quản lý. Hãy nhập câu hỏi bên dưới hoặc sử dụng các gợi ý nhanh để bắt đầu trao đổi ngay!",
    startCorrespondence: "BẮT ĐẦU ĐOẠN CORRESPONDENCE",
    you: "Bạn",
    inputPlaceholder: "Nhập nội dung tư vấn, phản ánh dịch vụ, yêu cầu đổi PT dời ca tập...",
    statusHeader: "TRẠNG THÁI GIAO DỊCH",
    statusBody: "Kênh giao tiếp này lưu giữ toàn bộ dữ liệu đối thoại chính xác giữa bạn và ban quản lý phòng GYM. Toàn bộ các yêu cầu của bạn về gói tập, dời lịch, cập nhật chỉ số sức khỏe sẽ được tiếp tân phản hồi nhanh chóng nhất.",
    memberId: "MEMBER_ID",
    fullNameLabel: "HỌ VÀ TÊN",
    roleAccessLabel: "QUYỀN TRUY CẬP",
    importantNotice: "LƯU Ý QUAN TRỌNG",
    importantNoticeBody: "Để đổi huấn luyện viên cá nhân PT hoặc yêu cầu hoàn phí giao dịch gói dịch vụ lỗi, anh/chị vui lòng chat trực tiếp ở đây kèm theo Mã biên nhận thanh toán (nếu có). Nhân sự lễ tân tiếp quản ca sẽ giải quyết ngay lập tức.",
    searchMemberPlaceholder: "Tìm hội viên...",
    latestChatHeader: "Hội thoại hỗ trợ mới nhất",
    noConversations: "Không tìm thấy cuộc trò chuyện nào.",
    connectingHeader: "Đang kết nối...",
    messagesCount: "MESSAGES_COUNT:",
    quickReplyTemplateLabel: "QUICK_REPLY_TEMPLATE:",
    quickReplyPrefix: "Mẫu",
    replyPlaceholder: "Nhập câu trả lời phản hồi cho hội viên...",
    noSelectedChatTitle: "KHÔNG CÓ CUỘC TRÒ CHUYỆN NÀO ĐƯỢC CHỌN",
    noSelectedChatDesc: "Hãy nhấp chọn một trong số các hội viên khởi tạo chat hỗ trợ ở danh sách bên trái để mở rộng phân phối timeline hội thoại và trực tiếp giải đáp thắc mắc.",
    staffTemplates: [
      "Xin chào anh/chị, GymMaster Pro nhận được yêu cầu của mình. Em có thể hỗ trợ gì cho mình hôm nay ạ?",
      "Chào anh/chị, ca tập của mình đã được điều chỉnh thành công trên hệ thống. Chúc anh/chị tập luyện vui vẻ nhé!",
      "Dạ hiện tại gói tập của mình sắp hết hạn, anh/chị có thể gia hạn online qua mã QR trong Cổng Hội Viên hoặc ghé quầy lễ tân để nhận thêm ưu đãi ạ.",
      "Báo cáo tập luyện và thông số PT của anh/chị đã được huấn luyện viên cập nhật. Anh/chị kiểm tra trong tab Huấn Luyện Viên nhé ạ!",
      "Dạ trung tâm mở cửa hoạt động từ 5:30 sáng đến 22:00 đêm tất cả các ngày trong tuần ạ."
    ],
    memberSuggestions: [
      "Tôi muốn dời ca tập sang buổi tối",
      "Tôi muốn tư vấn nâng cấp lên gói hội viên VIP",
      "Huấn luyện viên cá nhân PT của tôi hôm nay có ca trực không?",
      "Hỏi thông tin ưu đãi gia hạn tháng này"
    ]
  },
  en: {
    customerCorrespondence: "Member Communication & Support Channel",
    activeConnection: "LIVE_SERVER_CONNECTED",
    refreshTooltip: "Refresh inbox",
    loadingMailbox: "Loading communication mailbox...",
    supportHelpdesk: "MANAGEMENT & SUPPORT HELPDESK",
    onlineTag: "Online support 24/7",
    emptyMailboxTitle: "Communication Box Empty",
    emptyMailboxDesc: "You haven't sent any support messages yet. Please type your target question below or use the quick suggestions to start a real-time conversation!",
    startCorrespondence: "START OF CORRESPONDENCE TRACE",
    you: "You",
    inputPlaceholder: "Type questions, feedback, or requests to change PT/schedules...",
    statusHeader: "TRANSACTION STATE",
    statusBody: "This channel logs official conversations between you and the fitness center management. Your requests regarding fitness packages, scheduling, and health records will be handled by the staff on duty.",
    memberId: "MEMBER_ID",
    fullNameLabel: "FULL NAME",
    roleAccessLabel: "ROLE ACCESS",
    importantNotice: "IMPORTANT NOTICE",
    importantNoticeBody: "To request a changes of Personal Trainer (PT) or refund requests, please message here directly with a payment receipt if applicable. Our receptionists will manage it on your behalf.",
    searchMemberPlaceholder: "Search members...",
    latestChatHeader: "Latest support conversations",
    noConversations: "No active conversations found.",
    connectingHeader: "Connecting...",
    messagesCount: "MESSAGES_COUNT:",
    quickReplyTemplateLabel: "QUICK_REPLY_TEMPLATE:",
    quickReplyPrefix: "Template",
    replyPlaceholder: "Type your response for the active member...",
    noSelectedChatTitle: "NO CONVERSATION ACTIVE",
    noSelectedChatDesc: "Select an active member conversation from the list on the left to expand their thread timeline history and respond directly.",
    staffTemplates: [
      "Hello, GymMaster Pro has received your inquiry. How can we assist you today?",
      "Greetings, your roster/schedule has been successfully updated in our records. Train hard!",
      "An automated alert shows your membership package is expiring. You can renew online or at the reception desk.",
      "Your latest logs and PT fitness parameters have been updated by your coach. Please check your Coach tab!",
      "The resort gym open hours are from 5:30 AM to 10:00 PM including public weekends and holidays."
    ],
    memberSuggestions: [
      "I would like to move my trainer session to tonight",
      "I want to upgrade my package to a premium VIP membership",
      "Does my Personal Trainer (PT) have a shift scheduled today?",
      "Send current promotional renewal rates"
    ]
  },
  zh: {
    customerCorrespondence: "会员沟通与支持通道",
    activeConnection: "LIVE_SERVER_CONNECTED",
    refreshTooltip: "刷新信箱",
    loadingMailbox: "正在加载沟通箱...",
    supportHelpdesk: "管理与客服支持团队",
    onlineTag: "24/7 全天候在线客服",
    emptyMailboxTitle: "暂无沟通记录",
    emptyMailboxDesc: "您还没有发送过任何支持消息。请在下方输入您的问题或使用快速建议开始实时对话！",
    startCorrespondence: "服务对话记录起点",
    you: "您",
    inputPlaceholder: "输入咨询、反馈、更换教练、更改训练课时等内容...",
    statusHeader: "交易与账号状态",
    statusBody: "此对话通道记录您与健身俱乐部之间的官方对话。您关于课程套餐、日程变更、健康指标等任何诉求，均将由前台值班客服及时解答。",
    memberId: "会员编号",
    fullNameLabel: "会员姓名",
    roleAccessLabel: "访问权限",
    importantNotice: "重要注意事项",
    importantNoticeBody: "如需申请更换私教(PT)或申诉异常账单，请直接在此处发消息并附带支付单据。值班客服将立即协助解决。",
    searchMemberPlaceholder: "检索会员...",
    latestChatHeader: "最新支持消息",
    noConversations: "未找到相关支持会话。",
    connectingHeader: "正在连接...",
    messagesCount: "消息数量:",
    quickReplyTemplateLabel: "快速回复模板:",
    quickReplyPrefix: "模板",
    replyPlaceholder: "输入对会员的回复内容...",
    noSelectedChatTitle: "尚未选择任何会话",
    noSelectedChatDesc: "请从左侧列表点击一个正在咨询的会员会话，以展开对话轨迹并直接实时回复解决。",
    staffTemplates: [
      "您好，GymMaster Pro 已收到客服咨询，请问有什么可以协助您的？",
      "您好，为您调整的健身预约时间段已提交系统，祝您今天训练愉快！",
      "亲爱的会员，您的健身卡即将到期，您可以选择在会员系统在线续费或移步前台办理。",
      "您的最新 PT 体测分析与教练日志已被更新，您可以前往「专职教练」标签页内查看！",
      "我们的服务营业时间为每周一至周日的 5:30 至 22:00（含法定节假日）。"
    ],
    memberSuggestions: [
      "我想把今天的预约课程挪动到傍晚黄金时段",
      "请问有什么方式能够获取最新的 VIP 会员套餐权益信息？",
      "我想查询我的专职私教(PT)今天是否正常值班？",
      "请发送下本月限时续卡的特惠打折方案"
    ]
  }
};

export default function CommunicationPanel({ 
  user, 
  lang = "vi", 
  t,
  activeMemberId: propActiveMemberId,
  setActiveMemberId: propSetActiveMemberId,
  isMobile = false
}: CommunicationPanelProps) {
  const l = commTranslations[lang] ? lang : "vi";
  const ct = (key: string) => commTranslations[l]?.[key] || commTranslations["vi"]?.[key] || key;

  const [messages, setMessages] = useState<GymMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localActiveMemberId, setLocalActiveMemberId] = useState<number | null>(null);
  
  const activeMemberId = propActiveMemberId !== undefined ? propActiveMemberId : localActiveMemberId;
  const setActiveMemberId = propSetActiveMemberId !== undefined ? propSetActiveMemberId : setLocalActiveMemberId;

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick templates fetched from localized dictionary
  const staffTemplates = commTranslations[l]?.staffTemplates || commTranslations["vi"].staffTemplates;
  const memberSuggestions = commTranslations[l]?.memberSuggestions || commTranslations["vi"].memberSuggestions;


  // Fetch support messages and member list
  const fetchData = async () => {
    try {
      const msgRes = await fetch("/api/messages");
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData);
      }

      // If user is staff or admin, they need to list all members too for indexing conversation history
      if (user.role !== "MEMBER") {
        const memRes = await fetch("/api/members");
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.filter((m: any) => !m.deletedAt));
        }
      }
    } catch (err) {
      console.error("Error loading support correspondence:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto polling every 4 seconds to simulate active socket channels
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMemberId]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSending) return;

    setIsSending(true);

    // Determine target member identifier for connection
    let targetMemberId = user.role === "MEMBER" ? user.id : activeMemberId;
    let targetMemberName = "";

    if (user.role === "MEMBER") {
      targetMemberName = user.fullName;
    } else {
      const actMem = members.find(m => m.id === targetMemberId);
      targetMemberName = actMem ? actMem.fullName : "Hội viên";
    }

    if (!targetMemberId) {
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: targetMemberId,
          memberName: targetMemberName,
          senderId: user.username || `user_${user.id}`,
          senderName: user.fullName,
          senderRole: user.role,
          text: messageContent
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        if (!textToSend) setInputText("");
      }
    } catch (err) {
      console.error("Error saving support message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Helper properties
  const activeChatMessages = messages.filter(msg => {
    if (user.role === "MEMBER") {
      return msg.memberId === user.id;
    } else {
      return msg.memberId === activeMemberId;
    }
  });

  // Calculate unread or active conversations on personnel dashboard
  // Support interacting with all members in the system by combining members list and existing messages
  const uniqueConversations = (() => {
    const msgMemberIds = Array.from(new Set(messages.map(m => m.memberId)));
    const allIdTargets = Array.from(new Set([...members.map(m => m.id), ...msgMemberIds]));
    
    return allIdTargets.map(memId => {
      const memberObj = members.find(m => m.id === memId);
      const memMsgs = messages.filter(m => m.memberId === memId);
      const lastMsg = memMsgs[memMsgs.length - 1];
      
      return {
        memberId: memId,
        memberName: memberObj?.fullName || lastMsg?.memberName || `Hội viên #${memId}`,
        memberCode: memberObj?.memberCode || `MEM${String(memId).padStart(3, '0')}`,
        avatar: memberObj?.avatar,
        phone: memberObj?.phone || "Chưa có SĐT",
        email: memberObj?.email || "",
        lastMessageText: lastMsg?.text || "(Chưa có tin nhắn // No messages yet)",
        lastMessageTime: lastMsg?.createdAt || "",
        messagesCount: memMsgs.length
      };
    }).sort((a, b) => {
      // Prioritize threads with earlier conversation messages, sorted by descending message time, followed by name sorting
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }
      if (a.lastMessageTime && !b.lastMessageTime) return -1;
      if (!a.lastMessageTime && b.lastMessageTime) return 1;
      return a.memberName.localeCompare(b.memberName, "vi");
    });
  })();

  // Filter conversations based on search keys (Staff search)
  const filteredConversations = uniqueConversations.filter(c => 
    c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "";
    }
  };

  // -------------------------------------------------------------
  // RENDERING COMPONENT
  // -------------------------------------------------------------
  return (
    <div 
      id="support-communication-root" 
      className={`${isMobile ? "h-full" : "h-[calc(100vh-170px)]"} flex flex-col items-stretch overflow-hidden w-full`}
    >
      
      {/* Visual Ambient Header Banner */}
      {!isMobile && (
        <div className="shrink-0 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/5 rounded-[2rem] p-6 mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#CCFF00]/5 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
              <MessageCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest font-black italic block mb-0.5">CUSTOMER CORRESPONDENCE</span>
              <h2 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tight flex items-center gap-2">
                {ct("customerCorrespondence")}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-xl text-[10px] font-black font-mono text-green-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE_SERVER_CONNECTED
            </div>
            <button 
              onClick={fetchData} 
              className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/5 active:scale-95 transition-all"
              title={ct("refreshTooltip")}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 rounded-[2.5rem] border border-white/5">
          <RefreshCw className="w-8 h-8 text-[#CCFF00] animate-spin" />
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{ct("loadingMailbox")}</p>
        </div>
      ) : user.role === "MEMBER" ? (
        
        // =============================================================
        // MEMBER CHAT CONSOLE
        // =============================================================
        <div className={`flex-1 ${isMobile ? "flex flex-col h-full" : "grid grid-cols-1 lg:grid-cols-3 gap-6"} overflow-hidden`}>
          
          {/* Chat main field (Left/Center) */}
          <div className={`${isMobile ? "flex-1 h-full bg-transparent border-none rounded-none shadow-none" : "lg:col-span-2 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl"} flex flex-col overflow-hidden relative`}>
            {/* Thread Header */}
            <div className="p-5 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-wider">{ct("supportHelpdesk")}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">{ct("onlineTag")}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">GYMMASTER CONSULTING</span>
            </div>

            {/* Chat Body Scroll */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? "p-3.5" : "p-6"} space-y-4 custom-scrollbar bg-zinc-950/10`}>
              {activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-zinc-500">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="text-sm font-extrabold text-white uppercase italic tracking-wider">{ct("emptyMailboxTitle")}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {ct("emptyMailboxDesc")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center my-4">
                    <span className="bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-500 uppercase px-3 py-1 rounded-full tracking-widest">
                      {ct("startCorrespondence")}
                    </span>
                  </div>
                  
                  {activeChatMessages.map((msg, idx) => {
                    const isSelf = msg.senderRole === "MEMBER";
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1 max-w-[85%] ${isSelf ? 'ml-auto' : 'mr-auto'}`}
                      >
                        {/* Sender Label */}
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider px-1">
                          {isSelf ? ct("you") : `${msg.senderName} (${msg.senderRole})`}
                        </span>
                        
                        {/* Bubble */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          isSelf 
                            ? 'bg-[#CCFF00] text-black font-semibold rounded-br-sm shadow-lg shadow-[#CCFF00]/5' 
                            : 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        
                        {/* Time tag */}
                        <span className="text-[8px] font-mono text-zinc-650 flex items-center gap-1 px-1">
                          <Clock className="w-2 h-2" />
                          {formatTime(msg.createdAt)} - {formatDate(msg.createdAt)}
                          {isSelf && <Check className="w-2.5 h-2.5 text-[#CCFF00]" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Shelf */}
            <div className="shrink-0 px-4 py-3 bg-zinc-950/20 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              {memberSuggestions.map((suggest, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggest)}
                  className="inline-flex items-center gap-2 bg-zinc-950/60 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 border border-white/5 text-[10px] text-zinc-400 hover:text-[#CCFF00] font-bold px-4 py-2 rounded-2xl transition-all uppercase tracking-wider shrink-0 active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                  {suggest}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/40 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={ct("inputPlaceholder")}
                  className="flex-1 h-12 bg-white/5 border border-white/10 rounded-2xl px-5 py-2 outline-none focus:border-[#CCFF00]/40 text-sm text-white placeholder-zinc-650 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-12 h-12 rounded-2xl bg-[#CCFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-500 transition-all font-black flex items-center justify-center active:scale-90 hover:shadow-xl hover:shadow-[#CCFF00]/10 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Informational / Status Card (Right) */}
          {!isMobile && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#CCFF00]">
                  <Sparkles className="w-16 h-16" />
                </div>
                <h3 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest italic mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {ct("statusHeader")}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-medium">
                  {ct("statusBody")}
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-white/5 pb-2">
                    <span className="text-zinc-500">{ct("memberId")}</span>
                    <span className="text-white font-extrabold">#{String(user.id).padStart(4, "0")}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-white/5 pb-2">
                    <span className="text-zinc-500">{ct("fullNameLabel")}</span>
                    <span className="text-white font-extrabold">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] font-mono">
                    <span className="text-zinc-500">{ct("roleAccessLabel")}</span>
                    <span className="text-[#CCFF00] font-extrabold">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] p-6 text-zinc-400">
                <h4 className="text-xs font-black text-white uppercase italic tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  {ct("importantNotice")}
                </h4>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  {ct("importantNoticeBody")}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        
        // =============================================================
        // STAFF / PT / ADMIN MESSAGING CENTER
        // =============================================================
        <div className={`flex-1 ${isMobile ? "flex flex-col h-full" : "grid grid-cols-1 lg:grid-cols-4 gap-6"} overflow-hidden`}>
          
          {/* Members Chat History Sidebar List (Left panel - span 1) */}
          {(!isMobile || !activeMemberId) && (
            <div className={`${isMobile ? "flex-1 h-full bg-transparent border-none rounded-none shadow-none" : "lg:col-span-1 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-xl"} p-4 flex flex-col overflow-hidden relative`}>
            {/* Search filter box */}
            <div className="relative mb-4">
              <Search className="absolute top-3.5 left-4 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={ct("searchMemberPlaceholder")}
                className="w-full h-11 bg-zinc-950 border border-white/5 rounded-2xl pl-11 pr-4 outline-none text-xs text-white placeholder-zinc-500 focus:border-[#CCFF00]/20 font-mono"
              />
            </div>

            {/* Conversation list */}
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-2 mb-3 italic">{ct("latestChatHeader")}</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center p-6 text-zinc-650 italic text-xs">
                  {ct("noConversations")}
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const isActive = activeMemberId === chat.memberId;
                  return (
                    <button
                      key={chat.memberId}
                      onClick={() => setActiveMemberId(chat.memberId)}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
                        isActive
                          ? "bg-[#CCFF00] text-black shadow-lg"
                          : "bg-zinc-950/40 border border-white/5 hover:bg-zinc-800 text-zinc-200"
                      }`}
                    >
                      {/* Avatar placeholder */}
                      <div className="relative shrink-0">
                        {chat.avatar ? (
                          <img src={chat.avatar} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-black/15 text-black' : 'bg-white/5 text-zinc-400'}`}>
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-zinc-900 rounded-full" />
                      </div>

                      {/* Info details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className={`text-xs font-black truncate leading-none uppercase ${isActive ? 'text-black' : 'text-white'}`}>
                            {chat.memberName}
                          </p>
                          <span className={`text-[8px] font-mono shrink-0 font-medium ${isActive ? 'text-black/60' : 'text-zinc-500'}`}>
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-[8.5px] font-mono font-bold leading-none mb-1 text-left block ${isActive ? 'text-black/80' : 'text-[#CCFF00]'}`}>
                          {chat.memberCode}
                        </p>
                        <p className={`text-[11px] truncate text-left ${isActive ? 'text-black/70 font-semibold' : 'text-zinc-400'}`}>
                          {chat.lastMessageText}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

          {/* Current Chat workspace console (Right panel - span 3) */}
          {(!isMobile || activeMemberId) && (
            <div className={`${isMobile ? "flex-1 h-full bg-transparent border-none rounded-none shadow-none" : "lg:col-span-3 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-xl"} flex flex-col overflow-hidden relative`}>
              {activeMemberId ? (
                <>
                  {/* Active Chat Header */}
                  <div className="p-4 sm:p-5 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      {isMobile && (
                        <button 
                          onClick={() => setActiveMemberId(null)} 
                          className="mr-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-[#CCFF00] hover:bg-white/10 active:scale-95 transition-all text-sm font-black shrink-0 cursor-pointer"
                          title="Quay lại"
                        >
                          ←
                        </button>
                      )}
                      <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-zinc-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-2">
                        {members.find(m => m.id === activeMemberId)?.fullName || ct("connectingHeader")}
                        <span className="px-2 py-0.5 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[8px] font-black font-mono text-[#CCFF00] uppercase">
                          {members.find(m => m.id === activeMemberId)?.memberCode}
                        </span>
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-3 font-medium">
                        <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {members.find(m => m.id === activeMemberId)?.phone}</span>
                        {members.find(m => m.id === activeMemberId)?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {members.find(m => m.id === activeMemberId)?.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:inline">
                      MESSAGES_COUNT: {activeChatMessages.length}
                    </span>
                  </div>
                </div>

                {/* Correspondence Thread Scrollable Box */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/10">
                  {activeChatMessages.map((msg, idx) => {
                    const isSelf = msg.senderRole !== "MEMBER";
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1 max-w-[80%] ${isSelf ? 'ml-auto' : 'mr-auto'}`}
                      >
                        {/* Sender info */}
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest px-1">
                          {isSelf ? `${msg.senderName} (${msg.senderRole})` : `${msg.memberName} (${lang === 'vi' ? 'Hội viên' : lang === 'zh' ? '会员' : 'Member'})`}
                        </span>

                        {/* Text bubble */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          isSelf 
                            ? 'bg-white text-zinc-950 font-semibold rounded-br-sm shadow-xl' 
                            : 'bg-zinc-850 border border-white/5 text-zinc-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>

                        {/* Timestamp tag */}
                        <span className="text-[8px] font-mono text-zinc-650 flex items-center gap-1 px-1">
                          <Clock className="w-2 h-2" />
                          {formatTime(msg.createdAt)} - {formatDate(msg.createdAt)}
                          {isSelf && <Check className="w-2.5 h-2.5 text-[#CCFF00]" />}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Personnel fast response pre-saved templates */}
                <div className="shrink-0 px-4 py-3 bg-zinc-950/20 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
                  <span className="inline-flex items-center bg-zinc-900 border border-white/5 text-[9px] font-mono text-[#CCFF00] font-black px-3 py-2 rounded-2xl uppercase tracking-widest">
                    {ct("quickReplyTemplateLabel")}
                  </span>
                  {staffTemplates.map((template, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(template)}
                      className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 border border-white/5 text-[10.5px] text-zinc-400 hover:text-white font-bold px-4 py-2 rounded-2xl transition-all uppercase tracking-wider shrink-0 active:scale-95"
                      title={template}
                    >
                      {ct("quickReplyPrefix")} {i + 1}
                    </button>
                  ))}
                </div>

                {/* Active Chat Input field */}
                <div className="p-4 border-t border-white/5 bg-zinc-950/40 shrink-0">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={ct("replyPlaceholder")}
                      className="flex-1 h-12 bg-white/5 border border-[#CCFF00]/20 rounded-2xl px-5 py-2 outline-none focus:border-[#CCFF00]/40 text-sm text-white placeholder-zinc-650 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="w-12 h-12 rounded-2xl bg-[#CCFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-500 transition-all flex items-center justify-center hover:shadow-xl active:scale-90 duration-200 shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                  <MessageCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-black italic uppercase text-white tracking-widest">{ct("noSelectedChatTitle")}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    {ct("noSelectedChatDesc")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
