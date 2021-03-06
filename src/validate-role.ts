// validate-role.ts

export const validateRole = (role) => (next) => (root, args, context, info) => {
    if (context.currentUser.role !== role) {
        throw new Error(`Unauthorized!`);
    }

    return next(root, args, context, info);
};
