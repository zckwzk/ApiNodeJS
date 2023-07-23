import axios from "axios";

const apiSendEmail = async (body: { email: string; message: string }) => {
  //send email to api
  let url = "https://email-service.digitalenvision.com.au/send-email";
  return axios.post(url, body);
};

export { apiSendEmail };
