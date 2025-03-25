// import { StyleSheet, View, TouchableOpacity, Text, Button } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import groupApi from "@/api/group/group"
// import { GroupCategoryListParams, GroupCategoryListItem } from '@repo/types'
// import { useTranslation } from 'react-i18next';
// import { scale } from "app/utils/size";
// const CategoryItemContainer = (
//   props: {
//     groupId: number;
//     categoryList: GroupCategoryListItem[];
//     maxChoose: number;
//     onChange: (id: number, flag: boolean) => void;
//     onReset: () => void
//     onSave: () => Promise<void>
//   }
// ) => {
//   const insets = useSafeAreaInsets();
//   const {t} = useTranslation('screen-group-chat')
//   return (
//     <View style={[
//       styles.container,
//       { paddingTop: insets.top },
//       { paddingBottom: insets.bottom },
//     ]}>
//       <View style={styles.textArea}>
//         <Text style={styles.textA}>{t('title_category_label')}</Text>
//         <Text style={styles.textB}>{t('choose_label')} {props.categoryList.filter(c => c.checked).length}/{props.maxChoose}</Text>
//       </View>
//       <View style={styles.listContainer}>
//         <View style={styles.itemContainer}>
//           {
//             props.categoryList.map((item, index) => {
//               return <Chip key={item.id + "cate"}
//                 containerStyle={[styles.item, item.checked ? styles.itemChecked : styles.itemUnCheck]}
//                 labelStyle={item.checked ? { color: "white" } : { color: "black" }}
//                 label={item.name}
//                 borderRadius={scale(24)}
//                 onPress={() => { props.onChange(item.id, !item.checked) }
//                 }
//               />
//             })
//           }
//         </View>

//         <View style={styles.bottomArea}>
//           <Button style={[styles.button, { backgroundColor: "#EFF0F2" }]}
//             label={t('btn_reset')}
//             labelStyle={[styles.buttonFont, { color: "#333333" }]}
//             size='small' onPress={props.onReset}>
//           </Button>
//           <Button style={[styles.button, { backgroundColor: "#5B6979",marginLeft: scale(8) }]}
//             label={t('btn_submit')}
//             labelStyle={[styles.buttonFont]}
//             size='small' onPress={props.onSave}>
//           </Button>
//         </View>
//       </View>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "flex-start",
//     alignItems: "center",

//   },
//   textArea: {
//     marginTop: scale(50),
//     marginBottom: scale(20),
//     flexDirection: "row",
//     alignItems: "baseline",
//     alignSelf: "flex-start",
//     marginLeft: scale(10)
//   },
//   textA: {
//     fontSize: scale(16),
//     color: '#4b5563',
//   },
//   textB: {
//     color: '#6b7280',
//     fontSize: scale(10),
//     marginLeft: scale(10)
//   },
//   listContainer: {
//     flex: 0.9,
//     backgroundColor: "white",
//     borderRadius: scale(24),
//     alignSelf: "flex-start",
//     padding: scale(20),
//     justifyContent: 'space-between',
//   },
//   itemContainer: {
//     alignItems: "center",
//     justifyContent: "flex-start",
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   item: {
//     marginBottom: scale(20),
//     padding: scale(4),
//     // marginRight: scale(10),
//     marginLeft: scale(10),
//     height: scale(40),
//     borderWidth: scale(1),
//     textAlign: "center",
//     borderColor: '#f3f4f6',
//   },

//   itemUnCheck: {
//     backgroundColor: "white",
//   },
//   itemChecked: {
//     backgroundColor: '#374151',
//   },

//   bottomArea: {
//     flexDirection: "row",
//     justifyContent: 'space-between',
//     paddingLeft: "5%",
//     paddingRight: "5%",
//     marginBottom: "5%"
//   },

//   button: {
//     width: scale(122),
//     height: scale(42),
//     borderRadius: scale(30),
//     paddingHorizontal: scale(11),
//     justifyContent: 'center',
//   },
//   buttonFont: {
//     fontSize: scale(14),
//     textAlign: "center"
//   }


// })

// export default CategoryItemContainer
