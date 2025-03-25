import {
  GroupCreateReq,
  GroupChangeAvatarReq,
  GroupChangeAliasReq,
  GroupChangeNoticeReq,
  GroupChangeDescReq,
  GroupMemberResp, GroupInviteJoinReq,
  GroupKickOutReq, GroupChangeNameReq,
  GroupDetailResp, MineGroupInfoItem,
  GroupTransferReq,
  GroupIdsReq, GroupListIdResp, GroupApplyItem, GroupApplyJoinReq, GroupRequireJoinReq, GroupInfoDto,
  GroupMemberItem,
  GroupDetailItem,
  GroupMembersReq,
  GroupRequireJoinResp,
  GroupManagerChangeReq,
  GroupMemberListReq,
  GroupTagReq,
  GroupApplyListReq,
  GroupSingleItem
} from "@repo/types";
import { createInstance } from '../req';
import { BaseIdReq, BaseIdArrayReq, BaseIdsArrayReq, BaseArrayResp, BaseIdsNumberReq } from "@repo/types";

const create = async (param: GroupCreateReq): Promise<{ id: number }> => await createInstance(true).post('/groups/create', param);


const getGroupMembersById = async (param: GroupMemberListReq): Promise<BaseArrayResp<GroupMemberItem>> => await createInstance(true).post('/groups/members-list', param);


const getGroupMembers = async (param: GroupMembersReq): Promise<GroupMemberResp> => await createInstance(true).post('/groups/members', param);

const rejectJoin = async (param: GroupApplyJoinReq) => await createInstance(true).post('/groups/reject-join', param);

const agreeJoin = async (param: { id: number, uid: number, encPri: string, encKey: string }) => await createInstance(true).post('/groups/agree-join', param);

const inviteJoin = async (param: GroupInviteJoinReq) => await createInstance(true).post('/groups/invite-join', param);

// 申请加入群组
const requireJoin = async (param: GroupRequireJoinReq): Promise<GroupRequireJoinResp> => await createInstance(true).post('/groups/require-join', param);

const kickOut = async (param: GroupKickOutReq) => await createInstance(true).post('/groups/kick-out', param);

const mineGroupList = async (param: GroupIdsReq): Promise<BaseArrayResp<number>> => createInstance(true).post('/groups/list', param);
const searchGroup = async (param: { keyword: string }): Promise<BaseArrayResp<number>> => createInstance(true).post('/groups/search', param);

const groupInfoList = async (param: GroupIdsReq): Promise<BaseArrayResp<GroupInfoDto>> => await createInstance(true).post('/groups/list-by-ids', param);

const changeName = async (param: GroupChangeNameReq) => await createInstance(true).post('/groups/update-name', param);

const changeAvatar = async (param: GroupChangeAvatarReq) => await createInstance(true).post('/groups/update-avatar', param);

const changeAlias = async (param: GroupChangeAliasReq) => await createInstance(true).post('/groups/update-alias', param);

const changeAliasByManager = async (param: {
  id: number
  uid: number
  alias: string
}): Promise<{
  id: number
  uid: number
  alias: string
}> => await createInstance(true).post('/groups/update-member-alias', param);

const changeNotice = async (param: GroupChangeNoticeReq) => await createInstance(true).post('/groups/update-notice', param);

const changeDesc = async (param: GroupChangeDescReq) => await createInstance(true).post('/groups/update-desc', param);


const quit = async (param: BaseIdReq) => await createInstance(true).post('/groups/quit', param);

const quitBatch = async (param: { ids: number[] }) => await createInstance(true).post('/groups/quit-batch', param);

const quitAll = async () => await createInstance(true).post('/groups/quit-all');

const getNotice = async (param: BaseIdReq) => await createInstance(true).post('/groups/get-notice', param);

const dismiss = async (param: BaseIdArrayReq) => await createInstance(true).post('/groups/dismiss', param);

const transfer = async (param: GroupTransferReq) => await createInstance(true).post('/groups/transfer', param);

const addAdmin = async (param: GroupManagerChangeReq) => await createInstance(true).post('/groups/add-admin', param);

const removeAdmin = async (param: GroupManagerChangeReq) => await createInstance(true).post('/groups/remove-admin', param);

const applyList = async (param: GroupApplyListReq): Promise<BaseArrayResp<GroupApplyItem>> => await createInstance(true).post('/groups/apply-list', param);

const myApplyList = async (param: BaseIdsArrayReq): Promise<BaseArrayResp<MineGroupInfoItem>> => await createInstance(true).post('/groups/my-apply-list', param);

const groupSingleInfo = async (param: BaseIdsNumberReq): Promise<BaseArrayResp<GroupSingleItem>> => await createInstance(true).post('/groups/get-single-info', param);

const groupDetail = async (param: { ids: number[] }): Promise<GroupDetailResp> => await createInstance(true).post('/groups/get-batch-info', param);

const groupIdAfter = async (lastTime: number): Promise<BaseArrayResp<number>> => await createInstance(true).post('/groups/mine-id-after', { lastTime });

const clearGroupMessages = async (param: BaseIdsArrayReq) => await createInstance(true).post('/groups/clear-messages', param);

const groupDegist = async (param: { id: number }): Promise<GroupDetailItem> => await createInstance(true).post('/groups/get-info', param);

const saveGroupTag = async (param: GroupTagReq) => await createInstance(true).post('/groups/change-tag', param);

export default {
  create,
  getGroupMembers,
  getGroupMembersById,
  rejectJoin,
  agreeJoin,
  inviteJoin,
  requireJoin,
  kickOut,
  mineGroupList,
  groupInfoList,
  groupDegist,
  changeName,
  changeAvatar,
  changeAlias,
  changeAliasByManager,
  changeNotice,
  changeDesc,
  quit,
  quitBatch,
  quitAll,
  getNotice,
  dismiss,
  transfer,
  addAdmin,
  removeAdmin,
  applyList,
  myApplyList,
  groupDetail,
  saveGroupTag,
  clearGroupMessages,
  groupSingleInfo,
  searchGroup,
  groupIdAfter
}
