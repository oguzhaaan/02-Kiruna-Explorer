function LoginPage() {
  return (
    <div
      className="relative flex items-center justify-center w-screen h-screen bg-cover bg-center font-sans"
      style={{
        backgroundImage:
          "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Kiruna.jpg/2560px-Kiruna.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-80"></div>

      {/* Login box */}
      <div className="relative z-10 p-10 max-w-md w-full text-white text-opacity-80">
        <h2 className="text-4xl text-center mb-8">Login</h2>

        <form>
          <div className="mb-7 relative">
            <label
              className="block text-xl font-normal mb-3"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className="w-100 px-5 h-12 rounded-full bg-customGray bg-opacity-30 backdrop-blur shadow text-white text-lg focus:outline-none"
            />
          </div>

          <div className="mb-16">
            <label
              className="block text-xl font-normal mb-3"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-5 h-12  rounded-full bg-customGray bg-opacity-30 backdrop-blur shadow text-white text-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="w-44 h-14 bg-customGray bg-opacity-60 shadow text-2xl  font-normal text-black rounded-full hover:bg-gray-600"
            >
              Go back
            </button>
            <button
              type="submit"
              className="w-44 h-14  bg-customBlue bg-opacity-100 shadow text-2xl  font-normal rounded-full hover:bg-blue-700"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
