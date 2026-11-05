/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import {
  FileText,
  Shield,
  Users,
  RefreshCw,
  Tag,
} from "lucide-react";

const useStaticData = () => {
  const staticData = {
    header: {
      resourcesMenuItems: [
        {
          title: "Privacy Policy",
          path: "/privacy-policy",
          description: "How we collect, use, and protect your data",
          icon: Shield,
          image:
            "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
        {
          title: "Terms & Conditions",
          path: "/terms",
          description: "The rules and guidelines for using Botfizz",
          icon: FileText,
          image:
            "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
        {
          title: "Refund Policy",
          path: "/refund-policy",
          description: "Our fair and transparent refund & cancellation policy",
          icon: RefreshCw,
          image:
            "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
      ],
      aboutMenuItems: [
        {
          title: "About Us",
          path: "/about",
          description: "Meet the team behind Botfizz and our story",
          icon: Users,
          image:
            "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
        {
          title: "Pricing",
          path: "/pricing",
          description: "Simple plans for businesses of every size",
          icon: Tag,
          image:
            "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
      ],
    },
  };

  return staticData;
};

export default useStaticData;
