export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`,
    },
  });
};

export default notFound;
