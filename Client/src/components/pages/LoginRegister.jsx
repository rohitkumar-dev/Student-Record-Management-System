import { AppWindowIcon, CodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export function LoginRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const { setRole, setLoggedIn, loggedIn, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (loggedIn) {
      navigate("/dashboard");
    }
  }, [loggedIn]);

  const sendOtp = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Please check all details.");
      return;
    }
    try {
      setMessage("");
      const res = await axios.post(
        "/api/auth/register",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage("OTP sent successfully. Check your email.");
    } catch (err) {
      console.log(err);
      setMessage("Check your details");
    }
  };

  const registerUser = async () => {
    if (!email.trim() || !otp.trim() || !name.trim()) {
      setMessage("Please enter all details.");
      return;
    }
    try {
      setMessage("");
      const res = await axios.post(
        "/api/auth/verify-otp",
        {
          email,
          otp,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage("Registration successful, login now");
      loginUser();
    } catch (err) {
      console.log(err);
      setMessage("Check your details");
    }
  };

  const loginUser = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter email and password.");
      return;
    }
    try {
      setMessage("");
      const res = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage("Login successful!");
      setLoggedIn(true);
      setRole(res.data.role);
      setUser({ email });
      navigate("/dashboard"); // redirect where you want
    } catch (err) {
      console.log(err);
      setMessage("Check your details");
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 m-auto">
      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              {/* <CardTitle>Register</CardTitle> */}
              <CardDescription className={"text-center"}>
                Register using your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-name">Enter name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="tabs-demo-name"
                  type={"text"}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">Enter email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="tabs-demo-username"
                  type={"text"}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-password">Enter password</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="tabs-demo-password"
                  type={"password"}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">One time password</Label>
                <div className="flex flex-row gap-3">
                  <Button onClick={sendOtp} className={"w-1/2"}>
                    Send OTP
                  </Button>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={""}
                    type={"number"}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className={"flex flex-col"}>
              <Button onClick={registerUser} className={"w-full"}>
                Register
              </Button>
              <p className="text-center pt-5">{message}</p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              {/* <CardTitle>Login</CardTitle> */}
              <CardDescription className={"text-center"}>
                Login using you email and password
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Enter email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="tabs-demo-current"
                  type={"email"}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">Enter password</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="tabs-demo-new"
                  type={"password"}
                />
              </div>
            </CardContent>
            <CardFooter className={"flex flex-col"}>
              <Button onClick={loginUser} className={"w-full"}>
                Login
              </Button>
              <p className="text-center pt-5">{message}</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
