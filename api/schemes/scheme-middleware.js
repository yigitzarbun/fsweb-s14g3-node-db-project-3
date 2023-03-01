const schemeModel = require("./scheme-model");
const db = require("./../../data/db-config");
/*
  Eğer `scheme_id` veritabanında yoksa:

  durum 404
  {
    "message": "scheme_id <gerçek id> id li şema bulunamadı"
  }
*/
const checkSchemeId = async (req, res, next) => {
  try {
    const isExist = await schemeModel.findById(req.params.id);
    //const exist = db("schemes").where("scheme_id", req.params.id).first();
    if (isExist == null) {
      res
        .status(404)
        .json({ message: `scheme_id ${req.params.id} id li şema bulunamadı` });
    } else {
      next();
    }
  } catch (error) {}
  next();
};

/*
  Eğer `scheme_name` yoksa, boş string ya da string değil:

  durum 400
  {
    "message": "Geçersiz scheme_name"
  }
*/
const validateScheme = (req, res, next) => {
  const name = req.body.scheme_name;
  try {
    if (!name || name == "" || typeof name !== "string") {
      res.status(400).json({ message: "Geçersiz scheme_name" });
    } else {
      req.scheme_name = name;
    }
  } catch (error) {}
  next();
};

/*
  Eğer `instructions` yoksa, boş string yada string değilse, ya da
  eğer `step_number` sayı değilse ya da birden küçükse:

  durum 400
  {
    "message": "Hatalı step"
  }
*/
const validateStep = (req, res, next) => {};

module.exports = {
  checkSchemeId,
  validateScheme,
  validateStep,
};
