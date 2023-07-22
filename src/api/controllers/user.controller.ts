import Job from "../models/Job";
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
    return Promise.reject(error);
  }
};

const deleteUser = async (userId: any) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete unsent jobs associated with the user
    await Job.destroy({
      where: {
        userId,
        status: "pending",
      },
    });

    // Delete user
    await user.destroy();
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateUser = async (userId: any, userObj: any) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's properties
    let tempEmail = userObj.email || user.dataValues.email;
    let tempFirstname = userObj.firstname || user.dataValues.firstname;
    let tempLastname = userObj.lastname || user.dataValues.lastname;
    let tempLocation = userObj.location || user.dataValues.location;
    let tempBirthdate = userObj.birthdate || user.dataValues.birthdate;

    user.update({
      email: tempEmail,
      firstname: tempFirstname,
      lastname: tempLastname,
      location: tempLocation,
      birthdate: tempBirthdate,
    });

    await user.save();

    // Delete the user and unsent jobs associated with the user, it will generate automatically
    await Job.destroy({
      where: {
        userId: userId,
        status: "pending",
      },
    });

    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

export { createUser, deleteUser, updateUser };
