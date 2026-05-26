import User from "../models/User.js";

import Member from "../models/Member.js";

import MembershipPlan from "../models/MembershipPlan.js";

import Category from "../models/Category.js";

import Book from "../models/Book.js";

import Issue from "../models/Issue.js";

import Fine from "../models/Fine.js";



/* -------------------------------------------------------------------------- */
/*                               USER ↔ MEMBER                                */
/* -------------------------------------------------------------------------- */

User.hasOne(Member, {
  foreignKey: "user_id",
  as: "member",
});

Member.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});



/* -------------------------------------------------------------------------- */
/*                     MEMBERSHIP PLAN ↔ MEMBERS                              */
/* -------------------------------------------------------------------------- */

MembershipPlan.hasMany(Member, {
  foreignKey: "membership_plan_id",
  as: "members",
});

Member.belongsTo(MembershipPlan, {
  foreignKey: "membership_plan_id",
  as: "membership_plan",
});



/* -------------------------------------------------------------------------- */
/*                           CATEGORY ↔ BOOKS                                 */
/* -------------------------------------------------------------------------- */

Category.hasMany(Book, {
  foreignKey: "category_id",
  as: "books",
});

Book.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});



/* -------------------------------------------------------------------------- */
/*                           MEMBER ↔ ISSUES                                  */
/* -------------------------------------------------------------------------- */

Member.hasMany(Issue, {
  foreignKey: "member_id",
  as: "issues",
});

Issue.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});



/* -------------------------------------------------------------------------- */
/*                            BOOK ↔ ISSUES                                   */
/* -------------------------------------------------------------------------- */

Book.hasMany(Issue, {
  foreignKey: "book_id",
  as: "issues",
});

Issue.belongsTo(Book, {
  foreignKey: "book_id",
  as: "book",
});



/* -------------------------------------------------------------------------- */
/*                             ISSUE ↔ FINE                                   */
/* -------------------------------------------------------------------------- */

Issue.hasOne(Fine, {
  foreignKey: "issue_id",
  as: "fine",
});

Fine.belongsTo(Issue, {
  foreignKey: "issue_id",
  as: "issue",
});