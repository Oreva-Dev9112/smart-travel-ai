'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  HomeIcon, 
  MapIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';

interface FooterLink {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const footerLinks: FooterLink[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Search', href: '/search', icon: MapIcon },
  { name: 'Assistant', href: '/assistant', icon: ChatBubbleLeftRightIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const contactInfo = [
  { icon: EnvelopeIcon, text: 'contact@smarttravelplanner.com' },
  { icon: PhoneIcon, text: '+1 (555) 123-4567' },
  { icon: MapPinIcon, text: '123 Travel Street, Adventure City, AC 12345' },
  { icon: ClockIcon, text: 'Mon - Fri: 9:00 AM - 6:00 PM' },
];

const socialLinks = [
  { name: 'Facebook', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'Instagram', href: '#' },
  { name: 'LinkedIn', href: '#' },
];

const footerSections = [
  {
    title: 'Quick Links',
    links: footerLinks,
  },
  {
    title: 'Contact Us',
    content: (
      <div className="space-y-4">
        {contactInfo.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <item.icon className="w-5 h-5 text-luxury-accent mt-0.5" />
            <span className="text-luxury-text/80">{item.text}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    title: 'Follow Us',
    content: (
      <div className="grid grid-cols-2 gap-4">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-luxury-subtext hover:text-luxury-accent transition-colors"
          >
            {link.name}
          </motion.a>
        ))}
      </div>
    ),
  },
];

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <footer className="bg-luxury">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-luxury-accent">{section.title}</h3>
              {section.links ? (
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={linkIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: linkIndex * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="text-luxury-subtext hover:text-luxury-accent transition-colors flex items-center space-x-2"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        <span>{link.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                section.content
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-luxury-card text-center text-luxury-subtext">
          <p>&copy; {new Date().getFullYear()} Smart Travel Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 