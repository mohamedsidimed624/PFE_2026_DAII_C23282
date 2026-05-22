import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../motion/animation";
import {
  Users,
  ShieldCheck,
  Gavel,
  Building2,
  Network,
  BriefcaseBusiness,
} from "lucide-react";

function ConnectorVertical({ small = false }) {
  return (
    <div
      className={`mx-auto w-px bg-green-200 ${
        small ? "h-8" : "h-12"
      }`}
    />
  );
}

function OrgNode({ icon: Icon, title, desc, main = false }) {
  return (
    <motion.div variants={fadeInUp} className="relative z-10">
      <div
        className={`min-w-[280px] rounded-2xl border bg-white px-7 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
          main
            ? "border-green-300 shadow-green-100/60"
            : "border-slate-100 hover:border-green-200"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex items-center justify-center rounded-xl ${
            main
              ? "h-14 w-14 bg-green-600 text-white"
              : "h-12 w-12 bg-green-50 text-green-700"
          }`}
        >
          <Icon size={main ? 26 : 23} />
        </div>

        <h3 className="text-lg font-bold text-slate-900">{title}</h3>

        <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

function BranchNode({ icon: Icon, title, desc }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="relative flex flex-col items-center pt-8"
    >
      <div className="absolute top-0 hidden h-8 w-px bg-green-200 md:block" />

      <div className="h-full w-full rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-md">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Icon size={22} />
        </div>

        <h3 className="text-base font-bold text-slate-900">{title}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Teams() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-green-50 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-slate-50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
            <Network size={14} />
            Organisation
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Structure de{" "}
            <span className="text-green-600">l’Ordre</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Une organisation hiérarchique claire permettant d’assurer
            l’encadrement, la coordination et le respect de la déontologie
            médicale.
          </p>
        </motion.div>

        {/* Tree */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-5xl"
        >
          <div className="flex flex-col items-center">
            <OrgNode
              main
              icon={Users}
              title="Assemblée Générale"
              desc="Organe représentatif regroupant les médecins inscrits à l’Ordre."
            />

            <ConnectorVertical />

            <OrgNode
              icon={Building2}
              title="Conseil National de l’Ordre"
              desc="Instance de coordination, d’orientation et de supervision institutionnelle."
            />

            <ConnectorVertical small />

            {/* Branches */}
            <div className="relative mt-2 w-full">
              <div className="absolute left-1/2 top-0 hidden h-px w-2/3 -translate-x-1/2 bg-green-200 md:block" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <BranchNode
                  icon={BriefcaseBusiness}
                  title="Bureau Exécutif"
                  desc="Assure la gestion administrative et le suivi opérationnel des activités."
                />

                <BranchNode
                  icon={ShieldCheck}
                  title="Conseils de Section"
                  desc="Encadrent les catégories professionnelles et les domaines d’exercice."
                />

                <BranchNode
                  icon={Gavel}
                  title="Conseil de Discipline"
                  desc="Veille au respect des règles déontologiques et professionnelles."
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}