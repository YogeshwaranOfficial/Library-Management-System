import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreateMemberPayload, UpdateMemberPayload } from "./member.types.js";
import { Op, WhereOptions, Sequelize } from "sequelize";
import Issue from "../../database/models/Issue.js"; 


export const createMemberRepository = async (payload: CreateMemberPayload) => {
  // 💡 Safe database row instantiation with clean explicit formatting
  return await Member.create(payload as any);
};

export const getAllMembersRepository = async (
  query: Record<string, any>
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const todayString = new Date().toISOString().split("T")[0];

  await Member.update(
    { membership_status: "EXPIRED" },
    {
      where: {
        expiry_date: { [Op.lt]: todayString },
        membership_status: { [Op.ne]: "EXPIRED" },
      },
    }
  );

  // =========================================================
  // TABLE FILTERS (status affects table rows)
  // =========================================================

  const memberWhereClause: WhereOptions = {};

  if (query.status) {
    memberWhereClause.membership_status = query.status;
  } else if (query.membership_status) {
    memberWhereClause.membership_status = query.membership_status;
  }

  const userInclude: Record<string, any> = {
    model: User,
    as: "user",
    attributes: ["uuid", "name", "gmail", "phone_number"],
  };

  if (query.search) {
    userInclude.where = {
      name: {
        [Op.iLike]: `%${query.search}%`,
      },
    };
  }

  const planInclude: Record<string, any> = {
    model: MembershipPlan,
    as: "membership_plan",
    attributes: ["membership_plan_id", "plan_name", "price"],
  };

  if (query.plan) {
    planInclude.where = {
      plan_name: query.plan,
    };
  }

  // =========================================================
  // TABLE DATA QUERY
  // =========================================================

  const result = await Member.findAndCountAll({
    where: memberWhereClause,
    limit,
    offset,
    include: [userInclude, planInclude],
    order: [["created_at", "DESC"]],
    distinct: true,
  });

  const formattedRows = result.rows.map((memberInstance: any) => {
    const member = memberInstance.toJSON();

    const trueMemberId =
      member.id || member.member_id || "";

    const cleanUuidString = String(trueMemberId).replace(
      /-/g,
      ""
    );

    const shortToken = cleanUuidString
      .slice(-4)
      .toUpperCase();

    return {
      ...member,
      id: trueMemberId,
      displayId: `MEMBER-${shortToken || "0000"}`,
    };
  });

  // =========================================================
  // DASHBOARD COUNTS
  // ONLY PLAN FILTER SHOULD AFFECT THESE
  // STATUS FILTER MUST BE IGNORED
  // =========================================================

  let dashboardPlanWhere: any = {};

  if (query.plan) {
    const selectedPlan = await MembershipPlan.findOne({
      where: {
        plan_name: query.plan,
      },
      attributes: ["membership_plan_id"],
    });

    if (selectedPlan) {
      dashboardPlanWhere.membership_plan_id =
        selectedPlan.get("membership_plan_id");
    }
  }

  const [dashboardTotal, totalActive, totalExpired] =
    await Promise.all([
      Member.count({
        where: dashboardPlanWhere,
      }),

      Member.count({
        where: {
          ...dashboardPlanWhere,
          membership_status: "ACTIVE",
        },
      }),

      Member.count({
        where: {
          ...dashboardPlanWhere,
          membership_status: "EXPIRED",
        },
      }),
    ]);

  return {
    count: dashboardTotal, // dashboard total
    totalActive,
    totalExpired,
    rows: formattedRows, // table rows
  };
};

export const getMemberByIdRepository = async (memberId: string) => {
  return await Member.findByPk(memberId, {
    include: [
      { 
        model: User, 
        as: "user", 
        attributes: ["uuid", "name", "gmail"] 
      },
      { 
        model: MembershipPlan, 
        as: "membership_plan",
        attributes: ["membership_plan_id", "plan_name"]
      }
    ]
  });
};

export const updateMemberRepository = async (memberId: string, payload: UpdateMemberPayload) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  
  await member.update(payload as any);
  return await getMemberByIdRepository(memberId);
};

export const deleteMemberRepository = async (memberId: string) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  
  await member.destroy();
  return member;
};

export const getEligibleUsersForMemberRepository = async () => {
  // 1. Gather all existing member user IDs
  const activeMembers = await Member.findAll({
    attributes: ["user_id"],
    raw: true
  });

  const existingUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);

  // 2. Fetch users whose role is READER and are not in that list
  return await User.findAll({
    where: {
      role: "READER",
      uuid: {
        [Op.notIn]: existingUserIds.length > 0 ? existingUserIds : [""]
      }
    },
    attributes: [
      ["uuid", "id"], 
      "name", 
      ["gmail", "email"], 
      ["phone_number", "phoneNumber"] 
    ],
    order: [["name", "ASC"]]
  });
};

export const searchMembersByNameRepository = async (searchToken: string) => {
  const matches = await Member.findAll({
    include: [
      {
        model: User,
        as: "user",
        required: true, 
        where: {
          name: { [Op.iLike]: `%${searchToken}%` } 
        },
        attributes: ["name", "phone_number", "gmail"]
      },
      {
        model: MembershipPlan,
        as: "membership_plan",
        attributes: ["plan_name", "max_books_allowed"]
      }
    ]
  });

  const today = new Date();

  // 2. Loop over matches to compute real-time borrow load statistics
  const detailedResults = await Promise.all(
    matches.map(async (member: any) => {
      const activeBorrowsCount = await Issue.count({
        where: {
          member_id: member.member_id,
          returned_date: null 
        }
      });

      const maxAllowed = member.membership_plan?.max_books_allowed || 0;
      const planName = member.membership_plan?.plan_name || "No Plan";
      
      // 💡 FIXED: Safely parses and evaluates string dates for accurate expiration flags
      const isExpired = member.membership_status === "EXPIRED" || new Date(member.expiry_date) < today;

      let dynamicStatus = "GOOD";
      let statusMessage = `✓ Safe: Holds ${activeBorrowsCount}/${maxAllowed} books under ${planName} tier.`;
      let isBlocked = false;

      if (isExpired) {
        dynamicStatus = "EXPIRED";
        statusMessage = "❌ Blocked: Membership plan has expired.";
        isBlocked = true;
      } else if (activeBorrowsCount >= maxAllowed) {
        dynamicStatus = "LIMIT_EXCEEDED";
        statusMessage = `⚠️ Blocked: Quota limit hit! (${activeBorrowsCount}/${maxAllowed} assets held).`;
        isBlocked = true;
      } else if (activeBorrowsCount + 1 === maxAllowed) {
        dynamicStatus = "WARNING_LAST_SLOT";
        statusMessage = `⚠️ Warning: Last open slot! (${activeBorrowsCount}/${maxAllowed} held).`;
        isBlocked = false; 
      }

      return {
        member_id: member.member_id,
        name: member.user?.name || "Unknown",
        phone_number: member.user?.phone_number || "No Contact",
        membership_status: isExpired ? "EXPIRED" : member.membership_status,
        expiry_date: member.expiry_date,
        plan_name: planName,
        maxAllowed,
        currentBorrows: activeBorrowsCount,
        compliance: {
          status: dynamicStatus,
          message: statusMessage,
          isBlocked 
        }
      };
    })
  );

  return detailedResults;
};

export const getAllPlansWithMetrics = async (searchTerm?: string) => {
  const whereClause: any = {};
  
  // 💡 FIXED: Stripped the non-existent 'description' search parameter to avoid SQL crashes
  if (searchTerm) {
    whereClause.plan_name = { [Op.iLike]: `%${searchTerm}%` };
  }

  // 1. Fetch raw plans along with active/inactive counters per plan
  const plans = await MembershipPlan.findAll({
    where: whereClause,
    attributes: {
      include: [
        // 💡 FIXED: Pointed to explicit 'members' lowercase table and 'membership_status' column parameters
        [
          Sequelize.literal(`(
            SELECT COUNT(*)::int 
            FROM "members" AS m 
            WHERE m.membership_plan_id = "MembershipPlan".membership_plan_id 
            AND m.membership_status = 'ACTIVE'
          )`),
          'active_members_count'
        ],
        // 💡 FIXED: Inactive members are those whose membership_status evaluates to 'EXPIRED'
        [
          Sequelize.literal(`(
            SELECT COUNT(*)::int 
            FROM "members" AS m 
            WHERE m.membership_plan_id = "MembershipPlan".membership_plan_id 
            AND m.membership_status = 'EXPIRED'
          )`),
          'inactive_members_count'
        ]
      ]
    },
    // 💡 FIXED: Target the proper snake_case column 'created_at' matching model options configuration
    order: [["created_at", "DESC"]]
  });

  // 2. Fetch Global aggregated numbers across the complete platform
  // Using explicit Member.count builds clean optimized queries automatically and avoids raw SQL failures!
  const [globalActiveMembers, globalInactiveMembers] = await Promise.all([
    Member.count({
      where: {
        membership_status: "ACTIVE"
      }
    }),
    Member.count({
      where: {
        membership_status: "EXPIRED"
      }
    })
  ]);

  return {
    plans,
    globalActiveMembers,
    globalInactiveMembers
  };
};
