import Timezone from "../models/TimeZone";
import User from "../models/User";

const createUser = async (userObj: any) => {
  try {
    if (
      !userObj ||
      !userObj.email ||
      !userObj.firstname ||
      !userObj.lastname ||
      !userObj.location ||
      !userObj.birthdate
    ) {
      throw new Error("Missing required fields");
    }
    const { email, firstname, lastname, location, birthdate } = userObj;

    // Retrieve timezoneId based on location name
    const timezone = await Timezone.findOne({ where: { name: location } });

    if (!timezone) {
      throw new Error("Location is not valid");
    }

    const timezoneId = timezone.dataValues?.id;

    const user = await User.create({
      email,
      firstname,
      lastname,
      location,
      birthdate,
      TimezoneId: timezoneId,
    });

    return user;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

export { createUser };
