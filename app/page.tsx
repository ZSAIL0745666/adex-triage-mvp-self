"use client";

import { useEffect, useMemo, useState } from "react";

type MainFlow = "account" | "content" | "policy" | "other";
type AccountIssue =
  | "mmm_rejected"
  | "mmm_slow"
  | "advertiser_qualification_rejected"
  | "account_suspended"
  | "whitelist_rejected"
  | "whitelist_slow";
type AppealStatus = "yes" | "no" | "";
type ContentIssueMode = "bulk" | "individual" | "infringement" | "appeal" | "";
type ContentSource = "tiktok_shop_policy" | "community_guidelines" | "advertising_policies" | "unknown" | "";
type IndividualAppealStatus = "appealed_disagree" | "not_appealed" | "";
type IndividualRejectionType = "ad_group" | "gmv_max" | "product" | "topview" | "rf" | "";
type InfringementMode = "report" | "nominate" | "";
type AppealHelpMode = "bulk_how" | "ticket_type" | "slow_or_unsatisfied" | "";
type PolicyResult = "can_run_rejected" | "cannot_run_unlock" | "";
type PolicyIdType = "gmv_max_video_id" | "ad_group_id" | "";
type NoAppealReason = "" | "no_skill" | "plugin_issue" | "daily_limit";
type PluginIssueStep = "" | "still_issue";
type IndividualNoAppealReason = ContentSource;
type IndPluginStep = "" | "still_issue";
type FeishuRecipient = {
  id: string;
  name: string;
  openId: string;
};

const ADS_REVIEW_CONSULTATION_FORM_URL = "https://bytedance.sg.larkoffice.com/share/base/form/shrlg81K3IQA15q1HGAFghAvIye";
const ADEX_TICKET_PLATFORM_URL = "https://www.adsintegrity.net/ticket-platform/tickets/create";
const TICKET_PLATFORM_URL = ADEX_TICKET_PLATFORM_URL;
const MERCURY_DOC_URL = "https://bytedance.us.larkoffice.com/docx/T95HdXVDzoO2UCxdHAHu8ns7srh";
const FEISHU_RECIPIENTS: FeishuRecipient[] = [
  {
    id: "zhengyi",
    name: "郑屹",
    openId: "ou_39a49f355b5879cec2a5fd047e23b6de"
  },
  {
    id: "person_a",
    name: "负责人A",
    openId: "TODO_REPLACE_WITH_PERSON_A_OPEN_ID"
  },
  {
    id: "person_b",
    name: "负责人B",
    openId: "TODO_REPLACE_WITH_PERSON_B_OPEN_ID"
  },
  {
    id: "person_c",
    name: "负责人C",
    openId: "TODO_REPLACE_WITH_PERSON_C_OPEN_ID"
  },
  {
    id: "zzh",
    name: "周子航",
    openId: "ou_7d8a6e6df7621556ce0d21922b676706ccs"
  }
];
const BULK_APPEAL_PLUGIN_URL = "https://bytedance.sg.larkoffice.com/docx/Ui3Ader4yov7a5xcl5blMk5Ngaf";
const INFRINGEMENT_SOP_URL = "https://bytedance.sg.larkoffice.com/docx/SSzLdLb3Vouv07xIspLcEXBvnZg";
const PLUGIN_FEEDBACK_GROUP_URL = "https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=c40ibd6d-447e-4005-8427-e19df2v2dcud";
const ANGEL_ONCALL_URL = "https://applink.larkoffice.com/T962e8YSoqWF";
const AMS_ECOM_ONCALL_URL = "https://applink.larkoffice.com/T962ebEU24rm";
const TNS_ONCALL_URL = "https://applink.larkoffice.com/T962eprFUD2o";
const GMV_MAX_GUIDE_URL = "https://bytedance.larkoffice.com/wiki/OyeMwM786iA8qmk9Xkmc2CaxnQh";
const SOCIAL_CASINO_DOC_URL = "https://bytedance.larkoffice.com/wiki/GesGwb13TitpeBktwtXcwAdGnAe";

const mainFlows: Array<{ id: MainFlow; zh: string; en: string; detail: string }> = [
  { id: "account", zh: "账户问题", en: "Account Issues", detail: "封户 / 下户 / 白名单" },
  { id: "content", zh: "内容问题", en: "Content Issues", detail: "拒审/申诉/侵权" },
  { id: "policy", zh: "政策问题", en: "Policy Issues", detail: "品类/创意能否投放" },
  { id: "other", zh: "其他问题", en: "Other Issues", detail: "其他广告审核相关问题" }
];

const accountIssues: Array<{ id: AccountIssue; zh: string; en: string }> = [
  { id: "mmm_rejected", zh: "MMM下户被拒", en: "MMM account request rejected" },
  { id: "mmm_slow", zh: "MMM下户太慢（>24h）", en: "MMM account request slow (>24h)" },
  {
    id: "advertiser_qualification_rejected",
    zh: "新建advertiser account资质被拒",
    en: "New advertiser account qualification rejected"
  },
  { id: "account_suspended", zh: "广告户被封户", en: "Advertiser account suspended" },
  { id: "whitelist_rejected", zh: "白名单被拒绝", en: "Whitelist rejected" },
  { id: "whitelist_slow", zh: "白名单审核太慢（>24h）", en: "Whitelist review slow (>24h)" }
];

const individualTicketTypes: Array<{ id: IndividualRejectionType; rejection: string; ticket: string }> = [
  { id: "ad_group", rejection: "Ad Group", ticket: "Ad Group Disapproval Inquiry" },
  { id: "gmv_max", rejection: "GMV Max", ticket: "GMV Max Appeal" },
  { id: "product", rejection: "Product", ticket: "Product Catalog Disapproval Inquiry" },
  { id: "topview", rejection: "TopView", ticket: "TopView Disapproval Inquiry" },
  { id: "rf", rejection: "R&F", ticket: "R&F Disapproval Inquiry" }
];

const regionalTimeZones = [
  { label: "北京时间和日期", timeZone: "Asia/Shanghai" },
  { label: "美东时间和日期", timeZone: "America/New_York" },
  { label: "美西时间和日期", timeZone: "America/Los_Angeles" },
  { label: "英国时间和日期", timeZone: "Europe/London" }
];

function formatRegionalTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function getDefaultRecipient(): FeishuRecipient {
  return FEISHU_RECIPIENTS.find((item) => item.id === "zhengyi") || FEISHU_RECIPIENTS[0];
}

function getRecipientById(recipientId: string | null): FeishuRecipient | null {
  if (!recipientId) {
    return getDefaultRecipient();
  }

  return FEISHU_RECIPIENTS.find((item) => item.id === recipientId) || null;
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [currentRecipient, setCurrentRecipient] = useState<FeishuRecipient | null>(() => getDefaultRecipient());
  const [flow, setFlow] = useState<MainFlow | "">("");
  const [accountIssue, setAccountIssue] = useState<AccountIssue | "">("");
  const [contentIssueMode, setContentIssueMode] = useState<ContentIssueMode>("");
  const [individualStatus, setIndividualStatus] = useState<IndividualAppealStatus>("");
  const [infringementMode, setInfringementMode] = useState<InfringementMode>("");
  const [appealHelpMode, setAppealHelpMode] = useState<AppealHelpMode>("");
  const [contentForm, setContentForm] = useState({
    source: "" as ContentSource,
    time: "",
    reason: "",
    appealed: "" as AppealStatus,
    passRate: "50",
    passedTickets: "",
    rejectedTickets: "",
    rejectedItems: ""
  });
  const [policyForm, setPolicyForm] = useState({
    result: "" as PolicyResult,
    idType: "" as PolicyIdType,
    entityId: "",
    advertiserId: "",
    regions: "",
    spend: "",
    description: "",
    attachments: "",
    mercuryScreenshot: "",
    mercuryScreenshotFile: "",
    assetLink: "",
    assetFile: ""
  });
  const [ipProtectionForm, setIpProtectionForm] = useState({
    advertiserId: "",
    entityName: "",
    subBrands: "",
    brandWebsite: "",
    spend30Days: "",
    logoFile: "",
    nominationReason: ""
  });
  const [otherDetail, setOtherDetail] = useState("");
  const [copied, setCopied] = useState(false);
  const [noAppealReason, setNoAppealReason] = useState<NoAppealReason>("");
  const [pluginIssueStep, setPluginIssueStep] = useState<PluginIssueStep>("");
  const [individualNoAppealReason, setIndividualNoAppealReason] = useState<IndividualNoAppealReason>("");
  const [indPluginStep, setIndPluginStep] = useState<IndPluginStep>("");

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCurrentRecipient(getRecipientById(params.get("recipient")));
  }, []);

  const regionalTimes = useMemo(
    () =>
      now
        ? regionalTimeZones.map((item) => ({
            ...item,
            value: formatRegionalTime(now, item.timeZone)
          }))
        : [],
    [now]
  );

  const contentMessage = useMemo(() => {
    const rate = Number(contentForm.passRate);
    const showPassed = contentForm.appealed === "yes" && rate > 0;
    const showRejected = contentForm.appealed === "yes" && rate < 100;

    return `【批量拒审问题 / Bulk Rejection Issue】

时间 / Time:
${contentForm.time || "-"}

拒审原因 / Rejection reason:
${contentForm.reason || "-"}

是否申诉 / Appealed:
${contentForm.appealed === "yes" ? "是 / Yes" : contentForm.appealed === "no" ? "否 / No" : "-"}

申诉通过率 / Appeal pass rate:
${contentForm.appealed === "yes" && contentForm.passRate !== "" ? `${contentForm.passRate}%` : "-"}

通过ticket（三个ticket ID）/ Passed tickets:
${showPassed ? contentForm.passedTickets || "-" : "-"}

拒绝ticket（三个ticket ID）/ Rejected tickets:
${showRejected ? contentForm.rejectedTickets || "-" : "-"}

所有被拒 item（选填）/ All rejected items (optional):
${contentForm.rejectedItems || "-"}`;
  }, [contentForm]);

  const policyMessage = useMemo(() => {
    const canRun = policyForm.result === "can_run_rejected";
    const wantsUnlock = policyForm.result === "cannot_run_unlock";
    const idType =
      policyForm.idType === "gmv_max_video_id"
        ? "GMV MAX 视频ID / GMV MAX Video ID"
        : policyForm.idType === "ad_group_id"
          ? "Ad Group ID"
          : "-";

    return `【政策咨询 / Policy Consultation】

Mercury结果 / Mercury result:
${policyForm.mercuryScreenshot || policyForm.mercuryScreenshotFile || "-"}

是否可投 / Can run:
${canRun ? "回复可投但实际被拒 / Reply says can run but actually rejected" : wantsUnlock ? "回复不可投但想解锁 / Reply says cannot run but request unlock" : "-"}

ID类型 / ID type:
${idType}

ID:
${policyForm.entityId || "-"}

广告主ID / Advertiser ID:
${policyForm.advertiserId || "-"}

投放地区 / Target regions:
${policyForm.regions || "-"}

日均消耗 / Daily spend:
${policyForm.spend ? `${policyForm.spend} USD` : "-"}

产品/创意描述 / Product or creative description:
${policyForm.description || "-"}

附件 / Attachments:
Mercury截图 / Mercury screenshot: ${policyForm.mercuryScreenshot || policyForm.mercuryScreenshotFile || "-"}
产品/创意 / Product or creative: ${policyForm.assetLink || policyForm.assetFile || "-"}
其他附件 / Other attachments: ${policyForm.attachments || "-"}

需求 / Request:
${wantsUnlock ? "希望解锁 / Request unlock" : canRun ? "可以投但当前被拒，请协助排查 / Approved by Mercury but rejected, please help review" : "-"}`;
  }, [policyForm]);

  const noAppealPluginMessage = useMemo(
    () => `【批量拒审问题 / Bulk Rejection Issue】

时间 / Time:
${contentForm.time || "-"}

拒审原因 / Rejection reason:
${contentForm.reason || "-"}

是否申诉 / Appealed:
否 / No - 申诉插件有问题，群聊无法解决`,
    [contentForm.time, contentForm.reason]
  );

  const noAppealLimitMessage = useMemo(
    () => `【批量拒审问题 / Bulk Rejection Issue】

时间 / Time:
${contentForm.time || "-"}

拒审原因 / Rejection reason:
${contentForm.reason || "-"}

是否申诉 / Appealed:
否 / No - 单日申诉达到上限`,
    [contentForm.time, contentForm.reason]
  );

  const indPluginMessage = useMemo(
    () => `【个别拒审问题 / Individual Rejection Issue】

反馈提交时间 / Feedback Submission Time:
${contentForm.time || "-"}

拒审原因 / Rejection reason:
${contentForm.reason || "-"}

是否申诉 / Appealed:
否 / No - 申诉插件有问题，群聊无法解决`,
    [contentForm.time, contentForm.reason]
  );

  const indLimitMessage = useMemo(
    () => `【个别拒审问题 / Individual Rejection Issue】

批量申诉提交时间 / Bulk Appeal Submission Time:
${contentForm.time || "-"}

拒审原因 / Rejection reason:
${contentForm.reason || "-"}

是否申诉 / Appealed:
否 / No - 单日申诉达到上限`,
    [contentForm.time, contentForm.reason]
  );

  const otherMessage = `【其他广告审核相关问题 / Other Ads Review Issue】

已确认是其他广告审核相关问题。

具体问题 / Specific issue:
${otherDetail || "-"}`;

  const ipProtectionMessage = `【想要主动保护广告主的IP / Nominate advertiser IP for proactive protection】

广告主ID / Advertiser ID:
${ipProtectionForm.advertiserId || "-"}

主体名称 / Entity Name:
${ipProtectionForm.entityName || "-"}

子品牌名称（如有）/ Sub-Brands Names (if any):
${ipProtectionForm.subBrands || "-"}

品牌官网链接 / Brand Website Link:
${ipProtectionForm.brandWebsite || "-"}

广告消耗（近30天，USD）/ Ad spend (last 30 days, USD):
${ipProtectionForm.spend30Days || "-"}

Logo图片 / Logo image:
${ipProtectionForm.logoFile || "-"}

提名原因 / Reason for Nomination:
${ipProtectionForm.nominationReason || "-"}`;

  const selectedAccount = accountIssues.find((item) => item.id === accountIssue);
  const accountDirectForm =
    accountIssue === "mmm_rejected" ||
    accountIssue === "mmm_slow" ||
    accountIssue === "whitelist_rejected" ||
    accountIssue === "whitelist_slow";
  const accountTicketType =
    accountIssue === "advertiser_qualification_rejected"
      ? "Appeal -> Subject Qualification Disapproval Inquiry"
      : accountIssue === "account_suspended"
        ? "Appeal -> Account Suspension Appeal"
        : "";

  const contentCanContinue = contentForm.source === "advertising_policies";
  const contentNeedsRate = contentCanContinue && contentForm.appealed === "yes";
  const passRateNumber = Number(contentForm.passRate);
  const validPassRate =
    contentForm.passRate !== "" && Number.isFinite(passRateNumber) && passRateNumber >= 0 && passRateNumber <= 100;
  const contentShowPassed = contentNeedsRate && validPassRate && passRateNumber > 0;
  const contentShowRejected = contentNeedsRate && validPassRate && passRateNumber < 100;
  const ipProtectionReady = Boolean(
    ipProtectionForm.advertiserId.trim() &&
    ipProtectionForm.entityName.trim() &&
    ipProtectionForm.brandWebsite.trim() &&
    ipProtectionForm.spend30Days.trim() &&
    ipProtectionForm.nominationReason.trim()
  );

  const contentReady = Boolean(
    contentCanContinue &&
    contentForm.time &&
    contentForm.reason.trim() &&
    contentForm.appealed === "yes" &&
    validPassRate &&
    (!contentShowPassed || contentForm.passedTickets.trim()) &&
    (!contentShowRejected || contentForm.rejectedTickets.trim())
  );

  const policyReady = Boolean(
    policyForm.result &&
    (policyForm.result === "cannot_run_unlock" || (policyForm.idType && policyForm.entityId.trim())) &&
    policyForm.advertiserId.trim() &&
    policyForm.regions.trim() &&
    policyForm.spend.trim() &&
    policyForm.description.trim() &&
    (policyForm.mercuryScreenshot.trim() || policyForm.mercuryScreenshotFile.trim()) &&
    (policyForm.assetLink.trim() || policyForm.assetFile.trim())
  );
  const currentRecipientName = currentRecipient?.name || "未识别接收人";
  const sendViaFeishuLabel = `发送给${currentRecipientName} / Send via Feishu`;
  const openRecipientFeishuLabel = `跳转${currentRecipientName}飞书 / Open in Feishu`;

  function resetFlow(nextFlow: MainFlow) {
    setFlow(nextFlow);
    setAccountIssue("");
    setContentIssueMode("");
    setIndividualStatus("");
    setInfringementMode("");
    setAppealHelpMode("");
    setNoAppealReason("");
    setPluginIssueStep("");
    setIndividualNoAppealReason("");
    setIndPluginStep("");
    setCopied(false);
  }

  async function copyText(text: string, _type: MainFlow) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("复制失败，请手动复制 / Copy failed, please copy manually:", text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openFeishu(text: string, _type: MainFlow) {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    const recipient = currentRecipient;

    if (!recipient) {
      window.prompt(
        "当前 URL 的 recipient 参数未匹配到 FEISHU_RECIPIENTS 中的任何接收人，请检查专属链接或补充接收人配置。请手动复制以下内容：",
        text
      );
      return;
    }

    if (!recipient.openId || recipient.openId.startsWith("TODO_")) {
      window.prompt(
        `当前接收人 ${recipient.name} 的飞书 openId 未配置，请先在 FEISHU_RECIPIENTS 中补充 openId。请手动复制以下内容：`,
        text
      );
      return;
    }

    window.location.assign(`https://applink.larkoffice.com/client/chat/open?openId=${recipient.openId}`);
  }

  function openExternal(url: string, _type: MainFlow, _summary: string) {
    window.location.assign(url);
  }

  return (
    <main className="min-h-screen bg-[#eef3f4] text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">AdEx Triage MVP</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">销售问题分诊工具 / Sales Troubleshooting</h1>
            <p className="mt-3 inline-flex rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-muted">
              当前飞书接收人：{currentRecipientName} / Current Feishu recipient: {currentRecipientName}
            </p>
          </div>
        </header>

        <div className="flex-1 py-6">
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="grid flex-1 gap-1 text-xs font-semibold text-accent sm:grid-cols-2">
                {regionalTimes.length
                  ? regionalTimes.map((item) => (
                      <span key={item.timeZone}>{item.label}：{item.value}</span>
                    ))
                  : <span>时间加载中 / Loading time...</span>}
              </div>
              <button className="textBtn" onClick={() => window.location.reload()}>
                重置 / Reset
              </button>
            </div>
            <div className="mb-7">
              <div className="text-sm font-semibold text-accent">Step 1</div>
              <h2 className="mt-1 text-2xl font-semibold">选择问题类型 / Choose Issue Type</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {mainFlows.map((item) => (
                <button
                  key={item.id}
                  className={`choice ${flow === item.id ? "choiceActive" : ""}`}
                  onClick={() => resetFlow(item.id)}
                >
                  <span className="text-lg font-semibold">{item.zh}</span>
                  <span className="text-sm text-muted">{item.en}</span>
                  <span className="mt-2 text-xs font-semibold text-accent">{item.detail}</span>
                </button>
              ))}
            </div>

            {flow === "account" && (
              <Panel title="账户问题 / Account Issues" kicker="Step 2">
                <div className="grid gap-3 md:grid-cols-2">
                  {accountIssues.map((item) => (
                    <button
                      key={item.id}
                      className={`choice min-h-[96px] ${accountIssue === item.id ? "choiceActive" : ""}`}
                      onClick={() => setAccountIssue(item.id)}
                    >
                      <span className="font-semibold">{item.zh}</span>
                      <span className="text-sm text-muted">{item.en}</span>
                    </button>
                  ))}
                </div>

                {accountIssue && (
                  <ResultBox title={selectedAccount ? `${selectedAccount.zh} / ${selectedAccount.en}` : "Next action"}>
                    {accountDirectForm && (
                      <>
                        <p>请填写广审咨询表单，选择 Level 1 常规咨询 / Please fill in the Ads Review Consultation Form and select Level 1 general consultation.</p>
                        <ConsultationButtonGroup />
                      </>
                    )}
                    {accountTicketType && (
                      <>
                        <p>请先去 Ticket Platform 创建Appeal工单 / Please create an Appeal ticket first.</p>
                        <p className="font-semibold">选择工单类型 / Ticket type: {accountTicketType}</p>
                        <ActionLink onClick={() => openExternal(TICKET_PLATFORM_URL, "account", "Open Ticket Platform")}>打开 Ticket Platform / Open Ticket Platform</ActionLink>
                        <div className="mt-4 space-y-3 text-sm">
                          <p className="font-semibold">如果 24h 后无结果，或已出结果但不满意 / If no result after 24h, or the result is unsatisfactory:</p>
                          <p>请填写广审咨询表单，选择 Level 1 常规咨询 / Please fill in the Ads Review Consultation Form and select Level 1 general consultation.</p>
                          <ConsultationButtonGroup />
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                          <p className="font-semibold">
                            {accountIssue === "advertiser_qualification_rejected"
                              ? "如果近期出现多次资质卡审且申诉后均能通过 / If qualification has been rejected multiple times recently and appeals consistently pass:"
                              : "如果近期出现多次封户且申诉后均能通过 / If the account has been suspended multiple times recently and appeals consistently pass:"}
                          </p>
                          <p>请填写广审咨询表单，选择 Level 2 上升咨询 / Please fill in the Ads Review Consultation Form and select Level 2 escalation consultation.</p>
                          <ConsultationButtonGroup />
                        </div>
                      </>
                    )}
                  </ResultBox>
                )}
              </Panel>
            )}

            {flow === "content" && (
              <Panel title="内容问题 / Content Issues" kicker="Step 2">
                <div className="grid gap-3 md:grid-cols-4">
                  <button
                    className={`choice ${contentIssueMode === "bulk" ? "choiceActive" : ""}`}
                    onClick={() => {
                      setContentIssueMode("bulk");
                      setIndividualStatus("");
                      setInfringementMode("");
                      setAppealHelpMode("");
                    }}
                  >
                    <span className="font-semibold">批量拒审</span>
                    <span className="text-sm text-muted">Bulk rejection</span>
                  </button>
                  <button
                    className={`choice ${contentIssueMode === "individual" ? "choiceActive" : ""}`}
                    onClick={() => {
                      setContentIssueMode("individual");
                      setContentForm({ ...contentForm, source: "" });
                      setInfringementMode("");
                      setAppealHelpMode("");
                    }}
                  >
                    <span className="font-semibold">个别拒审</span>
                    <span className="text-sm text-muted">Individual rejection</span>
                  </button>
                  <button
                    className={`choice ${contentIssueMode === "infringement" ? "choiceActive" : ""}`}
                    onClick={() => {
                      setContentIssueMode("infringement");
                      setContentForm({ ...contentForm, source: "" });
                      setIndividualStatus("");
                      setAppealHelpMode("");
                    }}
                  >
                    <span className="font-semibold">侵权</span>
                    <span className="text-sm text-muted">IP infringement</span>
                  </button>
                  <button
                    className={`choice ${contentIssueMode === "appeal" ? "choiceActive" : ""}`}
                    onClick={() => {
                      setContentIssueMode("appeal");
                      setContentForm({ ...contentForm, source: "" });
                      setIndividualStatus("");
                      setInfringementMode("");
                    }}
                  >
                    <span className="font-semibold">申诉</span>
                    <span className="text-sm text-muted">Appeal</span>
                  </button>
                </div>

                {contentIssueMode === "bulk" && (
                  <div className="mt-8">
                    <h4 className="mb-5 text-lg font-semibold">批量拒审 / Bulk Rejection</h4>
                    <div className="grid gap-5 md:grid-cols-2 items-start">
	                      <Field label="查看拒审通知，判断是谁下的处罚 / Check the rejection notice to identify who issued the enforcement">
	                        <div className="grid gap-3">
	                          <button className={`choice min-h-[72px] ${contentForm.source === "advertising_policies" ? "choiceActive" : ""}`} onClick={() => setContentForm({ ...contentForm, source: "advertising_policies" })}>
	                            <span className="text-sm text-muted">BI处罚：出现 “tiktok&apos;s advertising policies” 字样 / Contains “tiktok&apos;s advertising policies”</span>
	                          </button>
	                          <button className={`choice min-h-[72px] ${contentForm.source === "tiktok_shop_policy" ? "choiceActive" : ""}`} onClick={() => setContentForm({ ...contentForm, source: "tiktok_shop_policy" })}>
	                            <span className="text-sm text-muted">GNE处罚：出现 “TikTok Shop policy” 字样 / Contains “TikTok Shop policy”</span>
	                          </button>
	                          <button className={`choice min-h-[72px] ${contentForm.source === "community_guidelines" ? "choiceActive" : ""}`} onClick={() => setContentForm({ ...contentForm, source: "community_guidelines" })}>
	                            <span className="text-sm text-muted">TNS处罚：出现 “community guidelines” 字样 / Contains “community guidelines”</span>
	                          </button>
	                          <button className={`choice min-h-[72px] ${contentForm.source === "unknown" ? "choiceActive" : ""}`} onClick={() => setContentForm({ ...contentForm, source: "unknown" })}>
	                            <span className="text-sm text-muted">不知道是谁处罚的 / Unknown enforcement owner</span>
                          </button>
                        </div>
                      </Field>
                      <div className="[&>div]:mt-0">
                        {contentForm.source === "tiktok_shop_policy" && (
                          <ResultBox title="GNE电商侧处罚 / This is from GNE">
                            <p>判断依据：处罚通知里出现 “TikTok Shop policy” 字样。</p>
                            <p>可以去飞书联系国际电商Angel Oncall处理，如果是美区，请搜索AMS E-Commerce Angel Oncall / Please contact International E-Commerce Angel Oncall on Feishu. For the US region, please search “AMS E-Commerce Angel Oncall”.</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <OncallCard
                                title="国际电商 Angel Oncall"
                                subtitle="International E-Commerce"
                                url={ANGEL_ONCALL_URL}
                              />
                              <OncallCard
                                title="AMS E-Commerce Angel Oncall"
                                subtitle="US region"
                                url={AMS_ECOM_ONCALL_URL}
                              />
                            </div>
                          </ResultBox>
                        )}
                        {contentForm.source === "community_guidelines" && (
                          <ResultBox title="TNS原生侧处罚 / This is from TNS">
                            <p>判断依据：处罚通知里出现 “community guidelines” 字样。</p>
                            <p>可以去飞书联系 TnS Content Safety Oncall 处理，若为美区搜索 “US Safety OnCall” / Please contact TnS Content Safety Oncall on Feishu. For the US region, please search “US Safety OnCall”.</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <OncallCard
                                title="TnS Content Safety Oncall"
                                subtitle="Global"
                                url={TNS_ONCALL_URL}
                              />
                              <OncallCard
                                title="US Safety OnCall"
                                subtitle="US region · 飞书搜索机器人"
                                hint={"无链接，请在飞书搜索\nUS Safety OnCall"}
                              />
                            </div>
                          </ResultBox>
                        )}
                        {contentForm.source === "unknown" && (
                          <>
                            <ResultBox title="无法判断处罚来源 / Unknown enforcement owner">
                              <p>请带着处罚截图找郑屹确认 / Please send the punishment screenshot to Zhengyi for confirmation.</p>
                              <ActionLink onClick={() => openFeishu("无法判断是谁下的处罚，需要带处罚截图找郑屹确认。", "content")}>{openRecipientFeishuLabel}</ActionLink>
                            </ResultBox>
                            <ResultBox title="GMV MAX 自查 / GMV MAX self-check">
                              <p>如果是 GMV MAX 相关，建议可以先参考该文档自查 / If GMV MAX related, please refer to this guide first.</p>
                              <ActionLink onClick={() => openExternal(GMV_MAX_GUIDE_URL, "content", "Open GMV MAX guide")}>GMV MAX troubleshooting guide</ActionLink>
                            </ResultBox>
                          </>
                        )}
                        {contentCanContinue && (
                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-muted">除“所有被拒 item”外，其余字段均为必填 / All fields are required except “All rejected items”.</p>
                            <Field label="问题出现时间 / Issue time">
                              <input type="date" value={contentForm.time} onChange={(event) => setContentForm({ ...contentForm, time: event.target.value })} />
                            </Field>
                            <Field label="是否已批量申诉 / Bulk appeal completed">
                              <div className="segmented">
                                <button className={contentForm.appealed === "yes" ? "selected" : ""} onClick={() => setContentForm({ ...contentForm, appealed: "yes" })}>Yes / 是</button>
                                <button className={contentForm.appealed === "no" ? "selected" : ""} onClick={() => { setContentForm({ ...contentForm, appealed: "no" }); }}>No / 否</button>
                              </div>
                            </Field>
                            <Field label="拒审理由 / Rejection reason">
                              <textarea value={contentForm.reason} onChange={(event) => setContentForm({ ...contentForm, reason: event.target.value })} placeholder="填写平台拒审理由 / Enter rejection reason" />
                            </Field>
                            <Field label="所有被拒 item（选填）/ All rejected items (optional)">
                              <textarea value={contentForm.rejectedItems} onChange={(event) => setContentForm({ ...contentForm, rejectedItems: event.target.value })} placeholder="支持 Excel 文件链接、表格链接、文本列表等 / Accepts Excel links, sheet links, or text lists" />
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>

                {contentCanContinue && contentForm.appealed === "no" && (
                  <div className="mt-6 rounded-lg border border-line bg-[#f8faf8] p-5">
                    <h4 className="mb-2 text-lg font-semibold">请先完成批量申诉 / Please complete bulk appeal first</h4>
                    <p className="text-sm text-ink">完成后回到此工具填写申诉通过率和 ticket ID。</p>
                    <p className="mt-3 text-sm font-semibold">遇到的具体问题 / Specific issue:</p>
                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                      <button
                        className={`choice min-h-[88px] ${noAppealReason === "no_skill" ? "choiceActive" : ""}`}
                        onClick={() => { setNoAppealReason("no_skill"); setPluginIssueStep(""); }}
                      >
                        <span className="font-semibold">不知道如何批量申诉</span>
                        <span className="text-sm text-muted">Don&apos;t know how to bulk appeal</span>
                      </button>
                      <button
                        className={`choice min-h-[88px] ${noAppealReason === "plugin_issue" ? "choiceActive" : ""}`}
                        onClick={() => { setNoAppealReason("plugin_issue"); setPluginIssueStep(""); }}
                      >
                        <span className="font-semibold">插件有问题，我要反馈</span>
                        <span className="text-sm text-muted">Plugin issue, need feedback</span>
                      </button>
                      <button
                        className={`choice min-h-[88px] ${noAppealReason === "daily_limit" ? "choiceActive" : ""}`}
                        onClick={() => { setNoAppealReason("daily_limit"); setPluginIssueStep(""); }}
                      >
                        <span className="font-semibold">单日申诉达到上限</span>
                        <span className="text-sm text-muted">Daily appeal limit reached</span>
                      </button>
                    </div>

                    {noAppealReason === "no_skill" && (
                      <div className="mt-4">
                        <ActionLink onClick={() => openExternal(BULK_APPEAL_PLUGIN_URL, "content", "Open bulk appeal plugin doc")}>批量申诉插件下载 / Download bulk appeal plugin</ActionLink>
                      </div>
                    )}

                    {noAppealReason === "plugin_issue" && (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-3">
                          <ActionLink onClick={() => openExternal(PLUGIN_FEEDBACK_GROUP_URL, "content", "Open feedback group")}>优先群里反馈 / Feedback in group first</ActionLink>
                          <ActionLink onClick={() => setPluginIssueStep("still_issue")}>群里反馈后依然有问题 / Still have issues after group feedback</ActionLink>
                        </div>
                        {pluginIssueStep === "still_issue" && (
                          <>
                            <div className="grid gap-3 md:grid-cols-2 items-start">
                              <Field label="反馈提交时间 / Feedback Submission Time">
                                <input type="date" value={contentForm.time} onChange={(event) => setContentForm({ ...contentForm, time: event.target.value })} style={{ height: '80px' }} />
                              </Field>
                              <Field label="拒审原因 / Rejection reason">
                                <textarea value={contentForm.reason} onChange={(event) => setContentForm({ ...contentForm, reason: event.target.value })} placeholder="填写平台拒审理由 / Enter rejection reason" style={{ minHeight: '80px', height: '80px', resize: 'none' }} />
                              </Field>
                            </div>
                            {contentForm.time && contentForm.reason.trim() && (
                              <MessagePreview text={noAppealPluginMessage}>
                                <button className="primaryBtn" onClick={() => copyText(noAppealPluginMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                                <button className="secondaryBtn" onClick={() => openFeishu(noAppealPluginMessage, "content")}>{sendViaFeishuLabel}</button>
                              </MessagePreview>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {noAppealReason === "daily_limit" && (
                      <div className="mt-4 space-y-3">
                        <div className="grid gap-3 md:grid-cols-2 items-start">
                          <Field label="批量申诉提交时间 / Bulk Appeal Submission Time">
                            <input type="date" value={contentForm.time} onChange={(event) => setContentForm({ ...contentForm, time: event.target.value })} style={{ height: '80px' }} />
                          </Field>
                          <Field label="拒审原因 / Rejection reason">
                            <textarea value={contentForm.reason} onChange={(event) => setContentForm({ ...contentForm, reason: event.target.value })} placeholder="填写平台拒审理由 / Enter rejection reason" style={{ minHeight: '80px', height: '80px', resize: 'none' }} />
                          </Field>
                        </div>
                        {contentForm.time && contentForm.reason.trim() && (
                          <MessagePreview text={noAppealLimitMessage}>
                            <button className="primaryBtn" onClick={() => copyText(noAppealLimitMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                            <button className="secondaryBtn" onClick={() => openFeishu(noAppealLimitMessage, "content")}>{sendViaFeishuLabel}</button>
                          </MessagePreview>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {contentNeedsRate && (
                  <div className="mt-6 grid gap-4">
                    <Field label="申诉通过率 / Appeal pass rate">
                      <div className="rangeWrap">
                        <div className="rangeLabels"><span>0%</span><strong>{contentForm.passRate}%</strong><span>100%</span></div>
                        <input type="range" min="0" max="100" step="1" value={contentForm.passRate} onChange={(event) => setContentForm({ ...contentForm, passRate: event.target.value })} />
                      </div>
                    </Field>
                    {contentForm.passRate !== "" && !validPassRate && <p className="text-sm font-semibold text-red-700">通过率需在 0 到 100 之间 / Pass rate must be 0-100.</p>}
                    {contentShowPassed && (
                      <Field label="3个通过的 ticket ID / 3 passed ticket IDs">
                        <textarea value={contentForm.passedTickets} onChange={(event) => setContentForm({ ...contentForm, passedTickets: event.target.value })} placeholder="例如 / Example: 123, 456, 789" />
                      </Field>
                    )}
                    {contentShowRejected && (
                      <Field label="3个拒绝的 ticket ID / 3 rejected ticket IDs">
                        <textarea value={contentForm.rejectedTickets} onChange={(event) => setContentForm({ ...contentForm, rejectedTickets: event.target.value })} placeholder="例如 / Example: 123, 456, 789" />
                      </Field>
                    )}
                  </div>
                )}

                {contentReady && (
                  <MessagePreview text={contentMessage}>
                    <button className="primaryBtn" onClick={() => copyText(contentMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                    <button className="secondaryBtn" onClick={() => openFeishu(contentMessage, "content")}>{sendViaFeishuLabel}</button>
                  </MessagePreview>
                )}
                  </div>
                )}

                {contentIssueMode === "individual" && (
                  <div className="mt-8 grid gap-5">
                    <h4 className="text-lg font-semibold">个别拒审 / Individual Rejection</h4>
                    <Field label="申诉状态 / Appeal status" wide>
                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          className={`choice ${individualStatus === "appealed_disagree" ? "choiceActive" : ""}`}
                          onClick={() => {
                            setIndividualStatus("appealed_disagree");
                            setIndividualNoAppealReason("");
                            setIndPluginStep("");
                          }}
                        >
                          <span className="font-semibold">已经申诉，不认可申诉结果或结果超24小时未出</span>
                          <span className="text-sm text-muted">Appealed, but disagree with the result or no result after 24h</span>
                        </button>
                        <button
                          className={`choice ${individualStatus === "not_appealed" ? "choiceActive" : ""}`}
                          onClick={() => { setIndividualStatus("not_appealed"); setIndividualNoAppealReason(""); setIndPluginStep(""); }}
                        >
                          <span className="font-semibold">没有申诉</span>
                          <span className="text-sm text-muted">Not appealed yet</span>
                        </button>
                      </div>
                    </Field>

                    {individualStatus === "appealed_disagree" && (
                      <ResultBox title="不认可申诉结果或结果超24小时未出 / Disagree with appeal result or no result after 24h">
                        <p>请填写广审咨询表单，选择 Level 1 常规咨询 / Please fill in the Ads Review Consultation Form and select Level 1 general consultation.</p>
                        <ConsultationButtonGroup />
                      </ResultBox>
                    )}

                    {individualStatus === "not_appealed" && (
                      <div className="mt-2 rounded-lg border border-line bg-[#f8faf8] p-5">
	                        <h4 className="mb-2 text-lg font-semibold">查看拒审通知，判断是谁下的处罚 / Check the rejection notice to identify who issued the enforcement</h4>
	                        <div className="mt-2 grid gap-3 md:grid-cols-4">
	                          <button
	                            className={`choice min-h-[88px] ${individualNoAppealReason === "advertising_policies" ? "choiceActive" : ""}`}
	                            onClick={() => setIndividualNoAppealReason("advertising_policies")}
	                          >
	                            <span className="text-sm text-muted">BI处罚：出现 “tiktok&apos;s advertising policies” 字样 / Contains “tiktok&apos;s advertising policies”</span>
	                          </button>
	                          <button
	                            className={`choice min-h-[88px] ${individualNoAppealReason === "tiktok_shop_policy" ? "choiceActive" : ""}`}
	                            onClick={() => { setIndividualNoAppealReason("tiktok_shop_policy"); setIndPluginStep(""); }}
	                          >
	                            <span className="text-sm text-muted">GNE处罚：出现 “TikTok Shop policy” 字样 / Contains “TikTok Shop policy”</span>
	                          </button>
	                          <button
	                            className={`choice min-h-[88px] ${individualNoAppealReason === "community_guidelines" ? "choiceActive" : ""}`}
	                            onClick={() => { setIndividualNoAppealReason("community_guidelines"); setIndPluginStep(""); }}
	                          >
	                            <span className="text-sm text-muted">TNS处罚：出现 “community guidelines” 字样 / Contains “community guidelines”</span>
	                          </button>
                          <button
                            className={`choice min-h-[88px] ${individualNoAppealReason === "unknown" ? "choiceActive" : ""}`}
                            onClick={() => { setIndividualNoAppealReason("unknown"); setIndPluginStep(""); }}
                          >
                            <span className="text-sm text-muted">不知道是谁处罚的 / Unknown enforcement owner</span>
                          </button>
                        </div>

                        {individualNoAppealReason === "tiktok_shop_policy" && (
                          <ResultBox title="GNE电商侧处罚 / This is from GNE">
                            <p>判断依据：处罚通知里出现 “TikTok Shop policy” 字样。</p>
                            <p>可以去飞书联系国际电商Angel Oncall处理，如果是美区，请搜索AMS E-Commerce Angel Oncall / Please contact International E-Commerce Angel Oncall on Feishu. For the US region, please search “AMS E-Commerce Angel Oncall”.</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <OncallCard
                                title="国际电商 Angel Oncall"
                                subtitle="International E-Commerce"
                                url={ANGEL_ONCALL_URL}
                              />
                              <OncallCard
                                title="AMS E-Commerce Angel Oncall"
                                subtitle="US region"
                                url={AMS_ECOM_ONCALL_URL}
                              />
                            </div>
                          </ResultBox>
                        )}

                        {individualNoAppealReason === "community_guidelines" && (
                          <ResultBox title="TNS原生侧处罚 / This is from TNS">
                            <p>判断依据：处罚通知里出现 “community guidelines” 字样。</p>
                            <p>可以去飞书联系 TnS Content Safety Oncall 处理，若为美区搜索 “US Safety OnCall” / Please contact TnS Content Safety Oncall on Feishu. For the US region, please search “US Safety OnCall”.</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <OncallCard
                                title="TnS Content Safety Oncall"
                                subtitle="Global"
                                url={TNS_ONCALL_URL}
                              />
                              <OncallCard
                                title="US Safety OnCall"
                                subtitle="US region · 飞书搜索机器人"
                                hint={"无链接，请在飞书搜索\nUS Safety OnCall"}
                              />
                            </div>
                          </ResultBox>
                        )}

                        {individualNoAppealReason === "advertising_policies" && (
                          <div className="mt-4 space-y-4">
                            <ResultBox title="请先创建Appeal工单 / Please create an Appeal ticket first">
                              <p>请先去 Ticket Platform 创建Appeal工单 / Please create an Appeal ticket first.</p>
                              <ActionLink onClick={() => openExternal(TICKET_PLATFORM_URL, "content", "Open Ticket Platform")}>打开 Ticket Platform / Open Ticket Platform</ActionLink>
                            </ResultBox>
                            <Field label="提交哪一种appeal工单？/ Which type of appeal ticket?">
                              <div className="grid grid-cols-[1fr_auto_1.4fr] gap-x-2 gap-y-2 items-center">
                                <div className="px-2 text-xs font-semibold text-accent">拒绝类型 / Rejection Type</div>
                                <div></div>
                                <div className="px-2 text-xs font-semibold text-accent">工单类型选择 / Ticket Type</div>
                                {individualTicketTypes.map((item) => (
                                  <div key={`${item.id}-rejection`} className="contents">
                                    <div className="rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold">{item.rejection}</div>
                                    <div className="px-1 text-lg text-muted">→</div>
                                    <div className="rounded-md border border-line bg-white px-4 py-3 text-sm">{item.ticket}</div>
                                  </div>
                                ))}
                              </div>
                            </Field>
                          </div>
                        )}

                        {individualNoAppealReason === "unknown" && (
                          <>
                            <ResultBox title="无法判断处罚来源 / Unknown enforcement owner">
                              <p>请带着处罚截图找郑屹确认 / Please send the punishment screenshot to Zhengyi for confirmation.</p>
                              <ActionLink onClick={() => openFeishu("无法判断是谁下的处罚，需要带处罚截图找郑屹确认。", "content")}>{openRecipientFeishuLabel}</ActionLink>
                            </ResultBox>
                            <ResultBox title="GMV MAX 自查 / GMV MAX self-check">
                              <p>如果是 GMV MAX 相关，建议可以先参考该文档自查 / If GMV MAX related, please refer to this guide first.</p>
                              <ActionLink onClick={() => openExternal(GMV_MAX_GUIDE_URL, "content", "Open GMV MAX guide")}>GMV MAX troubleshooting guide</ActionLink>
                            </ResultBox>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {contentIssueMode === "appeal" && (
                  <div className="mt-8 grid gap-5">
                    <h4 className="text-lg font-semibold">申诉 / Appeal</h4>
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold">请去 Ticket Platform 创建Appeal工单 / Please create an Appeal ticket on the Ticket Platform.</p>
                      <div>
                        <ActionLink onClick={() => openExternal(TICKET_PLATFORM_URL, "content", "Open Ticket Platform")}>打开 Ticket Platform / Open Ticket Platform</ActionLink>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <button
                        className={`choice ${appealHelpMode === "bulk_how" ? "choiceActive" : ""}`}
                        onClick={() => {
                          setAppealHelpMode("bulk_how");
                          setNoAppealReason("no_skill");
                          setPluginIssueStep("");
                        }}
                      >
                        <span className="font-semibold">如何批量提交申诉</span>
                        <span className="text-sm text-muted">How to submit bulk appeals</span>
                      </button>
                      <button
                        className={`choice ${appealHelpMode === "ticket_type" ? "choiceActive" : ""}`}
                        onClick={() => setAppealHelpMode("ticket_type")}
                      >
                        <span className="font-semibold">选择哪一种内容申诉工单</span>
                        <span className="text-sm text-muted">Choose content appeal ticket type</span>
                      </button>
                      <button
                        className={`choice ${appealHelpMode === "slow_or_unsatisfied" ? "choiceActive" : ""}`}
                        onClick={() => setAppealHelpMode("slow_or_unsatisfied")}
                      >
                        <span className="font-semibold">申诉超24小时未出结果/申诉结果不满意</span>
                        <span className="text-sm text-muted">No result after 24h or unsatisfied with result</span>
                      </button>
                    </div>

                    {appealHelpMode === "bulk_how" && (
                      <div className="rounded-lg border border-line bg-[#f8faf8] p-5">
                        <h4 className="mb-2 text-lg font-semibold">请先完成批量申诉 / Please complete bulk appeal first</h4>
                        <p className="text-sm text-ink">完成后回到此工具填写申诉通过率和 ticket ID。</p>
                        <p className="mt-3 text-sm font-semibold">遇到的具体问题 / Specific issue:</p>
                        <div className="mt-2 grid gap-3 md:grid-cols-3">
                          <button
                            className={`choice min-h-[88px] ${noAppealReason === "no_skill" ? "choiceActive" : ""}`}
                            onClick={() => { setNoAppealReason("no_skill"); setPluginIssueStep(""); }}
                          >
                            <span className="font-semibold">不知道如何批量申诉</span>
                            <span className="text-sm text-muted">Don&apos;t know how to bulk appeal</span>
                          </button>
                          <button
                            className={`choice min-h-[88px] ${noAppealReason === "plugin_issue" ? "choiceActive" : ""}`}
                            onClick={() => { setNoAppealReason("plugin_issue"); setPluginIssueStep(""); }}
                          >
                            <span className="font-semibold">插件有问题，我要反馈</span>
                            <span className="text-sm text-muted">Plugin issue, need feedback</span>
                          </button>
                          <button
                            className={`choice min-h-[88px] ${noAppealReason === "daily_limit" ? "choiceActive" : ""}`}
                            onClick={() => { setNoAppealReason("daily_limit"); setPluginIssueStep(""); }}
                          >
                            <span className="font-semibold">单日申诉达到上限</span>
                            <span className="text-sm text-muted">Daily appeal limit reached</span>
                          </button>
                        </div>

                        {noAppealReason === "no_skill" && (
                          <div className="mt-4">
                            <ActionLink onClick={() => openExternal(BULK_APPEAL_PLUGIN_URL, "content", "Open bulk appeal plugin doc")}>批量申诉插件下载 / Download bulk appeal plugin</ActionLink>
                          </div>
                        )}

                        {noAppealReason === "plugin_issue" && (
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-3">
                              <ActionLink onClick={() => openExternal(PLUGIN_FEEDBACK_GROUP_URL, "content", "Open feedback group")}>优先群里反馈 / Feedback in group first</ActionLink>
                              <ActionLink onClick={() => setPluginIssueStep("still_issue")}>群里反馈后依然有问题 / Still have issues after group feedback</ActionLink>
                            </div>
                            {pluginIssueStep === "still_issue" && (
                              <>
                                <div className="grid gap-3 md:grid-cols-2 items-start">
                                  <Field label="反馈提交时间 / Feedback Submission Time">
                                    <input type="date" value={contentForm.time} onChange={(event) => setContentForm({ ...contentForm, time: event.target.value })} style={{ height: '80px' }} />
                                  </Field>
                                  <Field label="拒审原因 / Rejection reason">
                                    <textarea value={contentForm.reason} onChange={(event) => setContentForm({ ...contentForm, reason: event.target.value })} placeholder="填写平台拒审理由 / Enter rejection reason" style={{ minHeight: '80px', height: '80px', resize: 'none' }} />
                                  </Field>
                                </div>
                                {contentForm.time && contentForm.reason.trim() && (
                                  <MessagePreview text={noAppealPluginMessage}>
                                    <button className="primaryBtn" onClick={() => copyText(noAppealPluginMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                                    <button className="secondaryBtn" onClick={() => openFeishu(noAppealPluginMessage, "content")}>{sendViaFeishuLabel}</button>
                                  </MessagePreview>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {noAppealReason === "daily_limit" && (
                          <div className="mt-4 space-y-3">
                            <div className="grid gap-3 md:grid-cols-2 items-start">
                              <Field label="批量申诉提交时间 / Bulk Appeal Submission Time">
                                <input type="date" value={contentForm.time} onChange={(event) => setContentForm({ ...contentForm, time: event.target.value })} style={{ height: '80px' }} />
                              </Field>
                              <Field label="拒审原因 / Rejection reason">
                                <textarea value={contentForm.reason} onChange={(event) => setContentForm({ ...contentForm, reason: event.target.value })} placeholder="填写平台拒审理由 / Enter rejection reason" style={{ minHeight: '80px', height: '80px', resize: 'none' }} />
                              </Field>
                            </div>
                            {contentForm.time && contentForm.reason.trim() && (
                              <MessagePreview text={noAppealLimitMessage}>
                                <button className="primaryBtn" onClick={() => copyText(noAppealLimitMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                                <button className="secondaryBtn" onClick={() => openFeishu(noAppealLimitMessage, "content")}>{sendViaFeishuLabel}</button>
                              </MessagePreview>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {appealHelpMode === "ticket_type" && (
                      <Field label="提交哪一种appeal工单？ / Which type of appeal ticket?" wide>
                        <div className="grid grid-cols-[1fr_auto_1.4fr] gap-x-2 gap-y-2 items-center">
                          <div className="px-2 text-xs font-semibold text-accent">拒绝类型 / Rejection Type</div>
                          <div></div>
                          <div className="px-2 text-xs font-semibold text-accent">工单类型选择 / Ticket Type</div>
                          {individualTicketTypes.map((item) => (
                            <div key={`${item.id}-appeal-ticket`} className="contents">
                              <div className="rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold">{item.rejection}</div>
                              <div className="px-1 text-lg text-muted">→</div>
                              <div className="rounded-md border border-line bg-white px-4 py-3 text-sm">{item.ticket}</div>
                            </div>
                          ))}
                        </div>
                      </Field>
                    )}

                    {appealHelpMode === "slow_or_unsatisfied" && (
                      <div className="rounded-lg border border-line bg-[#f8faf8] p-5">
                        <p className="text-lg font-semibold">请填写广审咨询表单，选择 Level 1 常规咨询 / Please fill in the Ads Review Consultation Form and select Level 1 general consultation.</p>
                        <div className="mt-4">
                          <ConsultationButtonGroup />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {contentIssueMode === "infringement" && (
                  <div className="mt-8 grid gap-5">
                    <h4 className="text-lg font-semibold">侵权 / IP Infringement</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        className={`choice ${infringementMode === "report" ? "choiceActive" : ""}`}
                        onClick={() => setInfringementMode("report")}
                      >
                        <span className="font-semibold">广告主被侵权，想要举报</span>
                        <span className="text-sm text-muted">Report IP infringement</span>
                      </button>
                      <button
                        className={`choice ${infringementMode === "nominate" ? "choiceActive" : ""}`}
                        onClick={() => setInfringementMode("nominate")}
                      >
                        <span className="font-semibold">想要主动保护广告主的IP</span>
                        <span className="text-sm text-muted">Nominate advertiser IP for proactive protection</span>
                      </button>
                    </div>

                    {infringementMode === "report" && (
                      <ResultBox title="侵权举报 / IP infringement report">
                        <p>提示销售走侵权举报 SOP 文档进行维权 / Please ask sales to follow the IP infringement report SOP for rights protection.</p>
                        <ActionLink onClick={() => openExternal(INFRINGEMENT_SOP_URL, "content", "Open infringement report SOP")}>打开侵权举报 SOP / Open IP infringement report SOP</ActionLink>
                      </ResultBox>
                    )}

                    {infringementMode === "nominate" && (
                      <div className="grid gap-4">
                        <div className="formGrid">
                          <p className="text-sm font-semibold text-muted md:col-span-2">除了标注“若有”，其他都是必填 / Except fields marked “if any”, all other fields are required.</p>
                          <Field label="广告主ID / Advertiser ID">
                            <input value={ipProtectionForm.advertiserId} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, advertiserId: event.target.value })} />
                          </Field>
                          <Field label="主体名称 / Entity Name">
                            <input value={ipProtectionForm.entityName} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, entityName: event.target.value })} />
                          </Field>
                          <Field label="子品牌名称（如有）/ Sub-Brands Names (if any)">
                            <input value={ipProtectionForm.subBrands} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, subBrands: event.target.value })} />
                          </Field>
                          <Field label="品牌官网链接 / Brand Website Link">
                            <input value={ipProtectionForm.brandWebsite} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, brandWebsite: event.target.value })} />
                          </Field>
                          <Field label="广告消耗（近30天，USD）/ Ad spend (last 30 days, USD)">
                            <input value={ipProtectionForm.spend30Days} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, spend30Days: event.target.value })} placeholder="例如 / Example: 10000 USD" />
                          </Field>
                          <Field label="Logo图片 / Logo image">
                            <input
                              type="file"
                              accept="image/*,.svg"
                              onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, logoFile: event.target.files?.[0]?.name || "" })}
                            />
                          </Field>
                          <Field label="提名原因 / Reason for Nomination" wide>
                            <textarea value={ipProtectionForm.nominationReason} onChange={(event) => setIpProtectionForm({ ...ipProtectionForm, nominationReason: event.target.value })} />
                          </Field>
                        </div>

                        {ipProtectionReady && (
                          <MessagePreview text={ipProtectionMessage}>
                            <button className="primaryBtn" onClick={() => copyText(ipProtectionMessage, "content")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                            <button className="secondaryBtn" onClick={() => openFeishu(ipProtectionMessage, "content")}>{sendViaFeishuLabel}</button>
                          </MessagePreview>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            )}

            {flow === "policy" && (
              <Panel title="政策问题 / Policy Issues" kicker="Step 2-5">
                <div className="grid gap-4 md:grid-cols-2 [&>div]:mt-0">
                  <ResultBox title="先走 Mercury 咨询 / Check Mercury consultation first">
                    <p>请先查看 Mercury 咨询SOP进行咨询。/ Please check the Mercury Consultation SOP first.</p>
                    <ActionLink onClick={() => openExternal(MERCURY_DOC_URL, "policy", "Open Mercury SOP Doc")}>打开 Mercury 咨询SOP文档 / Open Mercury SOP Doc</ActionLink>
                  </ResultBox>
                  <ResultBox title="*网赚RMG/Social Casino相关">
                    <p>如何判断，可参考该文档的「5. 游戏行业产品准入政策」。/ For identification, see section 5 &quot;Game Industry Product Access Policy&quot;.</p>
                    <ActionLink onClick={() => openExternal(SOCIAL_CASINO_DOC_URL, "policy", "Open Game Industry Policy Doc")}>打开游戏行业准入政策文档 / Open Game Industry Policy Doc</ActionLink>
                  </ResultBox>
                </div>

                <div className="mt-6 grid gap-4">
                  <Field label="如果已经有 Mercury 提交后的回复结果，但是出现以下情况 / If Mercury already replied but the following happens" wide>
                    <div className="grid gap-3 md:grid-cols-2">
                      <button className={`choice ${policyForm.result === "can_run_rejected" ? "choiceActive" : ""}`} onClick={() => setPolicyForm({ ...policyForm, result: "can_run_rejected" })}>
                        回复可投但实际被拒 / Reply says can run but actually rejected
                      </button>
                      <button className={`choice ${policyForm.result === "cannot_run_unlock" ? "choiceActive" : ""}`} onClick={() => setPolicyForm({ ...policyForm, result: "cannot_run_unlock" })}>
                        回复不可投但想解锁 / Reply says cannot run but request unlock
                      </button>
                    </div>
                  </Field>

                  {policyForm.result && (
                    <div className="formGrid">
                      <p className="text-sm font-semibold text-muted md:col-span-2">除了标注“若有”，其他都是必填 / Except fields marked “if any”, all other fields are required.</p>
                      <Field label={`ID类型 / ID type${policyForm.result === "cannot_run_unlock" ? "（若有）" : ""}`}>
                        <select
                          value={policyForm.idType}
                          onChange={(event) => setPolicyForm({ ...policyForm, idType: event.target.value as PolicyIdType })}
                        >
                          <option value="">请选择 / Select</option>
                          <option value="gmv_max_video_id">GMV MAX 视频ID / GMV MAX Video ID</option>
                          <option value="ad_group_id">Ad Group ID</option>
                        </select>
                      </Field>
                      <Field label={`ID${policyForm.result === "cannot_run_unlock" ? "（若有）" : ""}`}>
                        <input value={policyForm.entityId} onChange={(event) => setPolicyForm({ ...policyForm, entityId: event.target.value })} placeholder="Paste ID" />
                      </Field>
                      <Field label="Mercury咨询回答截图 / Mercury consultation reply screenshot">
                        <input value={policyForm.mercuryScreenshot} onChange={(event) => setPolicyForm({ ...policyForm, mercuryScreenshot: event.target.value })} placeholder="Paste link or note" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setPolicyForm({ ...policyForm, mercuryScreenshotFile: event.target.files?.[0]?.name || "" })}
                        />
                      </Field>
                      <Field label="产品/创意（图/视频）/ Product or creative">
                        <input value={policyForm.assetLink} onChange={(event) => setPolicyForm({ ...policyForm, assetLink: event.target.value })} placeholder="Asset link" />
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(event) => setPolicyForm({ ...policyForm, assetFile: event.target.files?.[0]?.name || "" })}
                        />
                      </Field>
                      <Field label="广告主ID / Advertiser ID">
                        <input value={policyForm.advertiserId} onChange={(event) => setPolicyForm({ ...policyForm, advertiserId: event.target.value })} />
                      </Field>
                      <Field label="投放地区 / Target regions">
                        <input value={policyForm.regions} onChange={(event) => setPolicyForm({ ...policyForm, regions: event.target.value })} placeholder="US, EU, SEA..." />
                      </Field>
                      <Field label="日均消耗（USD）/ Daily spend">
                        <input type="number" min="0" value={policyForm.spend} onChange={(event) => setPolicyForm({ ...policyForm, spend: event.target.value })} />
                      </Field>
                      <Field label="附件 / Attachments">
                        <input value={policyForm.attachments} onChange={(event) => setPolicyForm({ ...policyForm, attachments: event.target.value })} placeholder="Optional links" />
                      </Field>
                      <Field label="描述 / Description" wide>
                        <textarea value={policyForm.description} onChange={(event) => setPolicyForm({ ...policyForm, description: event.target.value })} />
                      </Field>
                    </div>
                  )}
                </div>

                {policyReady && (
                  <MessagePreview text={policyMessage}>
                    <button className="primaryBtn" onClick={() => copyText(policyMessage, "policy")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                    <button className="secondaryBtn" onClick={() => openFeishu(policyMessage, "policy")}>{sendViaFeishuLabel}</button>
                  </MessagePreview>
                )}
              </Panel>
            )}

            {flow === "other" && (
              <Panel title="其他问题 / Other Issues" kicker="Step 2">
                <Field label="具体问题 / Specific issue" wide>
                  <textarea value={otherDetail} onChange={(event) => setOtherDetail(event.target.value)} placeholder="简单描述销售遇到的广告审核相关问题 / Briefly describe the ads review issue" />
                </Field>
                {otherDetail.trim() && (
                  <MessagePreview text={otherMessage}>
                    <button className="primaryBtn" onClick={() => copyText(otherMessage, "other")}>{copied ? "已复制 / Copied" : "复制文本 / Copy"}</button>
                    <button className="secondaryBtn" onClick={() => openFeishu(otherMessage, "other")}>{sendViaFeishuLabel}</button>
                  </MessagePreview>
                )}
              </Panel>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-line pt-8">
      <div className="mb-5">
        <div className="text-sm font-semibold text-accent">{kicker}</div>
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`field ${wide ? "md:col-span-2" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ResultBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border border-line bg-[#f8faf8] p-5">
      <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      <div className="space-y-3 text-sm text-ink">{children}</div>
    </div>
  );
}

function OncallCard({ title, subtitle, url, hint }: { title: string; subtitle?: string; url?: string; hint?: string }) {
  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(url)}` : "";
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-line bg-white p-3">
      <div className="text-center">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
      </div>
      {url ? (
        <>
          <img src={qrSrc} alt={`${title} QR`} className="h-32 w-32" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full justify-center rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent"
          >
            打开飞书 / Open in Feishu
          </a>
        </>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-line bg-field text-center text-xs text-muted">
          {hint || "飞书直接搜索机器人 / Search bot in Feishu"}
        </div>
      )}
    </div>
  );
}

function ActionLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-accent" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function ConsultationButtonGroup() {
  const buttonClassName = "inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-accent";

  return (
    <div className="flex flex-wrap gap-3">
      <a href={ADS_REVIEW_CONSULTATION_FORM_URL} target="_blank" rel="noreferrer" className={buttonClassName}>
        打开广审咨询表单 / Open Ads Review Consultation Form
      </a>
      <a href={ADEX_TICKET_PLATFORM_URL} target="_blank" rel="noreferrer" className={buttonClassName}>
        打开工单平台提交AdEx工单 / Open Ticket Platform to Submit AdEx Ticket
      </a>
    </div>
  );
}

function MessagePreview({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 rounded-lg border border-line bg-field p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-semibold">生成文本 / Generated Message</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-ink">{text}</pre>
    </div>
  );
}
