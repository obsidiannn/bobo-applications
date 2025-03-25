import { createInstance } from '../req';

const getInfo = async () => await createInstance(true).post('/friendUserExtendInfo/getInfo');

export default {
  getInfo
}