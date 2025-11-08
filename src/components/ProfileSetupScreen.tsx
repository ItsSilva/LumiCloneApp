import { motion } from "motion/react";
import { User, Activity } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";

interface ProfileSetupScreenProps {
  onNext: () => void;
}

export function ProfileSetupScreen({ onNext }: ProfileSetupScreenProps) {
  const { setProfile } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    gender: "female" as "male" | "female" | "other",
    weight: 65,
    height: 170,
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "very",
  });

  const handleSubmit = () => {
    setProfile(formData);
    onNext();
  };
  return (
    <div className="relative h-full bg-gradient-to-br from-mint-50 via-blue-50 to-purple-50 overflow-hidden p-6 flex flex-col">
      {/* Background elements */}
      <motion.div
        className="absolute top-1/4 right-10 w-32 h-32 bg-green-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Header */}
      <div className="mb-6">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl flex items-center justify-center mb-4"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <User className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-gray-800 mb-1">Crea tu perfil</h2>
        <p className="text-sm text-gray-500">Personalicemos tu viaje de bienestar</p>
      </div>

      {/* Progress droplet */}
      <div className="mb-6">
        <div className="relative w-full h-2 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "60%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">60% completo</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto space-y-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm text-gray-600 mb-2 block">Nombre</Label>
            <Input
              id="name"
              placeholder="Tu nombre"
              className="bg-white/80 border-gray-200 rounded-xl"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age" className="text-sm text-gray-600 mb-2 block">Edad</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                className="bg-white/80 border-gray-200 rounded-xl"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm text-gray-600 mb-2 block">Género</Label>
              <Select value={formData.gender} onValueChange={(value: any) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="bg-white/80 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm text-gray-600 mb-2 block">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="65"
                className="bg-white/80 border-gray-200 rounded-xl"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-sm text-gray-600 mb-2 block">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                className="bg-white/80 border-gray-200 rounded-xl"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <Label className="text-sm text-gray-700">Nivel de Actividad</Label>
          </div>

          <div>
            <Label htmlFor="activity" className="text-sm text-gray-600 mb-2 block">¿Qué tan activo eres?</Label>
            <Select value={formData.activityLevel} onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}>
              <SelectTrigger className="bg-white/80 border-gray-200 rounded-xl">
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentario - Poco o ningún ejercicio</SelectItem>
                <SelectItem value="light">Ligeramente activo - 1-3 días/semana</SelectItem>
                <SelectItem value="moderate">Moderadamente activo - 3-5 días/semana</SelectItem>
                <SelectItem value="very">Muy activo - 6-7 días/semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-gray-600">
              💡 Calcularemos tus necesidades de proteína y fibra automáticamente basado en tu información
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          className="w-full mt-4 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-full"
          onClick={handleSubmit}
        >
          Calcular mis necesidades
        </Button>
      </motion.div>
    </div>
  );
}
