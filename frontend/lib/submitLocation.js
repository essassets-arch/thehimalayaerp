// Fall back to HTTP unless the server confirms processing the socket update.
export async function submitLocation(socket, payload, sendViaHttp) {
  if (socket?.connected) {
    const accepted = await new Promise((resolve) => {
      socket.timeout(5000).emit('user:location:update', payload, (error, result) => {
        resolve(!error && result?.success === true);
      });
    });
    if (accepted) return;
  }
  await sendViaHttp(payload);
}
