import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";

import AppScreen from "../components/AppScreen";
import { AUTH_API } from "../src/config/api";

const steps = {
  request: "request",
  verify: "verify",
  reset: "reset",
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(steps.request);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const requestOtp = async () => {
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Could not send OTP. Please try again.");
        return;
      }

      setStep(steps.verify);
      setSuccess(data?.message || "If your account exists, a code has been sent.");
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "OTP verification failed.");
        return;
      }

      setResetToken(data.resetToken || "");
      setStep(steps.reset);
      setSuccess("OTP verified. Set your new password.");
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Reset session expired. Please request a new OTP.");
      setStep(steps.request);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${AUTH_API}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Password reset failed.");
        return;
      }

      setSuccess(data?.message || "Password reset successfully.");
      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch {
      setError("Network error. Could not reach server. Check IP/WiFi and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen
      backgroundColor="#F5F8FC"
      barStyle="dark-content"
      keyboardAware
      bottomOffset={24}
      horizontalPadding={18}
    >
      <View style={styles.container}>
        <View style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Recover your BookFlow account with a secure 6-digit email code.
            </Text>
          </View>

          <View style={styles.card}>
            {!!error && (
              <NoticeBox kind="error" icon="error-outline" text={error} />
            )}

            {!!success && (
              <NoticeBox kind="success" icon="check-circle-outline" text={success} />
            )}

            <View style={styles.stepsRow}>
              <StepPill label="Email" active={step === steps.request} complete={step !== steps.request} />
              <StepPill label="OTP" active={step === steps.verify} complete={step === steps.reset} />
              <StepPill label="Reset" active={step === steps.reset} complete={false} />
            </View>

            <Text style={styles.fieldLabel}>Email</Text>
            <Field
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading && step === steps.request}
            />

            {step === steps.verify && (
              <>
                <Text style={styles.fieldLabel}>6-Digit OTP</Text>
                <Field
                  icon="lock-reset"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChangeText={(value) => {
                    setOtp(value.replace(/\D/g, "").slice(0, 6));
                    if (error) setError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </>
            )}

            {step === steps.reset && (
              <>
                <Text style={styles.fieldLabel}>New Password</Text>
                <Field
                  icon="lock-outline"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    if (error) setError("");
                  }}
                  secureTextEntry={securePassword}
                  rightIcon={securePassword ? "visibility" : "visibility-off"}
                  onRightIconPress={() => setSecurePassword((value) => !value)}
                  editable={!loading}
                />

                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <Field
                  icon="lock-outline"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (error) setError("");
                  }}
                  secureTextEntry={secureConfirmPassword}
                  rightIcon={secureConfirmPassword ? "visibility" : "visibility-off"}
                  onRightIconPress={() => setSecureConfirmPassword((value) => !value)}
                  editable={!loading}
                />
              </>
            )}

            <Pressable
              onPress={
                loading
                  ? undefined
                  : step === steps.request
                    ? requestOtp
                    : step === steps.verify
                      ? verifyOtp
                      : resetPassword
              }
              style={({ pressed }) => [
                styles.primaryBtn,
                loading && styles.primaryBtnDisabled,
                pressed && !loading && styles.primaryBtnPressed,
              ]}
            >
              {loading ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Please wait...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>
                  {step === steps.request
                    ? "Send OTP"
                    : step === steps.verify
                      ? "Verify OTP"
                      : "Reset Password"}
                </Text>
              )}
            </Pressable>

            {step !== steps.request && (
              <Pressable
                onPress={loading ? undefined : requestOtp}
                style={({ pressed }) => [styles.inlineAction, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.inlineActionText}>Resend OTP</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.replace("/login")}
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.secondaryBtnText}>
                Remembered your password? <Text style={styles.link}>Back to Login</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

function NoticeBox({ kind, icon, text }) {
  const isError = kind === "error";

  return (
    <View
      style={[
        styles.noticeBox,
        isError ? styles.noticeBoxError : styles.noticeBoxSuccess,
      ]}
    >
      <MaterialIcons
        name={icon}
        size={18}
        color={isError ? "#B42318" : "#15803D"}
      />
      <Text style={[styles.noticeText, isError ? styles.noticeTextError : styles.noticeTextSuccess]}>
        {text}
      </Text>
    </View>
  );
}

function StepPill({ label, active, complete }) {
  return (
    <View
      style={[
        styles.stepPill,
        active && styles.stepPillActive,
        complete && styles.stepPillComplete,
      ]}
    >
      <Text
        style={[
          styles.stepPillText,
          active && styles.stepPillTextActive,
          complete && styles.stepPillTextComplete,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function Field({
  icon,
  rightIcon = null,
  onRightIconPress = null,
  style = null,
  ...props
}) {
  return (
    <View style={[styles.field, style]}>
      <View style={styles.fieldIcon}>
        <MaterialIcons name={icon} size={18} color="#6B7280" />
      </View>

      <TextInput placeholderTextColor="#9CA3AF" style={styles.input} {...props} />

      {rightIcon ? (
        <Pressable
          onPress={onRightIconPress}
          hitSlop={10}
          style={({ pressed }) => [styles.rightIcon, pressed && { opacity: 0.8 }]}
        >
          <MaterialIcons name={rightIcon} size={18} color="#6B7280" />
        </Pressable>
      ) : (
        <View style={styles.rightIcon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
  },
  page: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  noticeBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  noticeBoxError: {
    backgroundColor: "rgba(255, 232, 230, 0.95)",
    borderColor: "#FDA29B",
  },
  noticeBoxSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  noticeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12.5,
    flex: 1,
  },
  noticeTextError: {
    color: "#7A271A",
  },
  noticeTextSuccess: {
    color: "#166534",
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  stepPill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stepPillActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
  },
  stepPillComplete: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A7F3D0",
  },
  stepPillText: {
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  stepPillTextActive: {
    color: "#1D4ED8",
  },
  stepPillTextComplete: {
    color: "#15803D",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E0EA",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#334155",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    marginBottom: 6,
  },
  fieldIcon: {
    width: 30,
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    paddingVertical: 0,
  },
  rightIcon: {
    width: 30,
    alignItems: "center",
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: "#1D4ED8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnPressed: {
    transform: [{ scale: 0.99 }],
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
  },
  inlineAction: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 6,
  },
  inlineActionText: {
    color: "#1D4ED8",
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
  },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#64748B",
    fontFamily: "Poppins_500Medium",
    fontSize: 13.5,
  },
  link: {
    color: "#1D4ED8",
    fontFamily: "Poppins_700Bold",
  },
});
