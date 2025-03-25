import { IServer } from "@repo/types";
import { IUser } from "drizzle/schema";

export type AppStackParamList = {
  WelcomeScreen: undefined;
  HomeScreen: undefined;
  // 🔥 Your screens go here
  Login: undefined;
  GroupScreen: undefined;
  ChatScreen: undefined;
  UserScreen: undefined;
  UserChatScreen: undefined;
  GroupChatScreen: undefined
  WebViewScreen: {
    title: string;
    url: string;
  };
  SignInScreen: undefined;
  SignUpScreen: undefined;
  UnlockScreen: undefined;
  TabStack: undefined;
  ContactScreen: undefined;
  PlazaScreen: undefined;
  WalletScreen: undefined;
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
  UserChatInfoModal: {
    user: IUser
    chatId: string
  };
  InviteFriendScreen: {
    userId: number
  };
  InviteInfoScreen: {
    friendApply: IServer.IFriendApply;
    user: IUser;
  }
  FriendInviteRecordScreen: undefined
  AddFriendModal: undefined
  UserInfoScreen: {

  }
}
