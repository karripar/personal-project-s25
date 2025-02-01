
const customLog = (message: string) => {
  if (process.env.NODE_ENV === 'dev') {
    console.log(message);
  } else {
    return;
  }
};


export { customLog };
