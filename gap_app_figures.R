
library(tidyverse)
library(mgcv)
library(cowplot)

# Build corrected Minetti GAP model


# --- Load data ---

# - Black et al data
n_total <- 68+24 #92 total subjects
black_df <- read_csv("black_data_all.csv", show_col_types = FALSE) %>%
  #Speed in m/s, Cr in J/kg/m
  mutate(speed_m_s = speed_kmh/3.6,
         energy_j_kg_m = energy_kcal_kg_km*4.184,
         category = factor(category, 
                           levels = c("recreational", "elite"))
  ) %>%
  mutate(category = fct_recode(category,
                               Elite = "elite",
                               Recreational = "recreational")) %>%
  mutate(pace_min_mi = 1/(speed_m_s*60/1609.344)) %>%
  #SD is average of +/-1 sd
  mutate(st_dev = 0.5*(energy_kcal_kg_km - sd_lower) + 0.5*(sd_upper - energy_kcal_kg_km),
         st_dev_joules = st_dev*4.184) %>%
  #Weights should be (1/variance) * (n_group / n_total), SD squared is variance 
  mutate(reg_weight = 1/(st_dev_joules**2)*n_group*n_total) %>%
  #normalize weights
  mutate(reg_weight = reg_weight/sum(reg_weight))

# Published minetti function
minetti_fx <- function(x_grade){
  return(155.4*x_grade**5 - 30.4*x_grade**4 - 43.3*x_grade**3 + 46.3*x_grade**2 + 19.5*x_grade + 3.6)
}


# -------------------- Fit model ------------------------------


#Black: Cr as fxn of speed, for elites
black_mod <- gam(energy_j_kg_m ~ s(speed_m_s, bs="cr", k=4) + category,
              data = black_df,
              weights = reg_weight)

summary(black_mod)
plot(black_mod)



# -------------------- Plot data ------------------------------

#-- Plot setup
err_lwd <- 1
sz <- 2
lwd <- 1.5
alf <- 0.4
jt <- 0.075

kipp_sz <- 4
kipp_lwd <- 2
kipp_alf <- 0.8
jt_2 <- 0.03

#Text
fnt <- 12
title_fnt <- 14
subtitle_fnt <- 12
wm_fnt <- 12

#M<argin
plt_marg <- c(5,20,5,5)




# -------------    Grids for plotting ----------
ng <- 201

# Black - show model fit
df_speed_plot <- expand.grid(speed_m_s = seq(0.5,8, length.out = ng),
                             category = factor(c("Elite", "Recreational"))) %>%
  mutate(pace_min_mi = 1/(speed_m_s*60/1609.344))
df_speed_plot$cr_hat <- predict(black_mod, newdata = df_speed_plot) %>% as.vector()


# Minetti - fit for speed as fxn of incline, also fitted equation
df_incline_plot <- data.frame(slope = seq(-0.5,0.5, length.out=ng),
                              category = factor("Elite"))
#Minetti quintic polynomial eqn
df_incline_plot$minetti_Cr_eqn <- minetti_fx(df_incline_plot$slope)



# ---- Make plots -----

library(scales)

speed_pace_seq <- seq(0,6,by=1)
speed_pace_labs <- 1

#Black plot
black_plt_cr <- black_df %>%
  ggplot(aes(x=speed_m_s, y=energy_j_kg_m, color=category)) +
  geom_linerange(aes(ymin = energy_j_kg_m - st_dev_joules,
                     ymax = energy_j_kg_m + st_dev_joules),
                 linewidth = err_lwd,
                 position = position_dodge(width=jt)) + 
  geom_point(size = sz,
             position = position_dodge(width=jt)) + 
  geom_line(aes(x=speed_m_s, y=cr_hat, color=category),
            data = df_speed_plot,
            linetype="solid",
            alpha = alf,
            linewidth = lwd) +
  scale_color_brewer(palette="Set1", name="Category") + 
  scale_y_continuous(limits=c(0,6.5), breaks = seq(0,6,by=1), expand =c(0,0),
                     name = "Metabolic cost (J/kg/m)") + 
  ggtitle("Energetic cost of flat-ground running",
          subtitle = "Data from Black et al. 2018") + 
  labs(caption = "RunningWritings.com") + 
  theme_bw() + 
  theme(plot.title = element_text(hjust = 0.5, size=title_fnt),
        plot.subtitle = element_text(hjust = 0.5, size=subtitle_fnt),
        plot.caption = element_text(face = "bold", size = wm_fnt, vjust=0),
        legend.position = "bottom",
        legend.text = element_text(size = fnt),
        plot.caption.position = "plot",
        axis.title = element_text(size = fnt, color = "black"),
        axis.text = element_text(size = fnt, color = "black"),
        axis.line = element_line(colour = "black",
                                 lineend = "square"),
        axis.ticks = element_line(color="black"),
        panel.border = element_blank(),
        plot.margin = unit(plt_marg, "pt")
  )


black_plt_cr



# --- Black Cr as minutes per mile
  
jt <- 0.15

conv_units <- function(m_s) 1/(m_s*60/1609.344)

pace_labs <- c("14:00","12:00","10:00","8:00","7:00","6:00","5:00")



black_pace_plt <- black_df %>%  
  ggplot(aes(x=pace_min_mi, y=energy_j_kg_m, color=category)) +
  geom_linerange(aes(ymin = energy_j_kg_m - st_dev_joules,
                     ymax = energy_j_kg_m + st_dev_joules),
                 linewidth = err_lwd,
                 position = position_dodge(width=jt)) + 
  geom_point(size = sz,
             position = position_dodge(width=jt)) + 
  geom_line(aes(x=pace_min_mi, y=cr_hat, color=category),
            data = df_speed_plot,
            linetype="solid",
            alpha = alf,
            linewidth = lwd) +
  scale_color_brewer(palette="Set1", name=NULL) + 
  scale_x_reverse(limits = c(15,5), breaks = c(14,12,10,8,7,6,5),
                  labels = pace_labs,
                  expand = c(0,0),
                  name = "Pace (min/mi)") + 
  scale_y_continuous(limits = c(0,6), breaks = seq(0,6,by=1),
                     name = "Energetic cost (J/kg/m)",
                     expand = c(0,0)) + 
  ggtitle("Energetic cost of flat-ground running",
          subtitle = "Data from Black et al. 2018") + 
  labs(caption = "RunningWritings.com") + 
  guides(color = guide_legend(ncol = 1)) + 
  theme_bw() + 
  theme(plot.title = element_text(hjust = 0.5, size=title_fnt),
        plot.subtitle = element_text(hjust = 0.5, size=subtitle_fnt),
        plot.caption = element_text(face = "bold", size = wm_fnt, vjust=0),
        #LETENGD
        legend.position = c(0.05,0.2),
        legend.justification = "left",
        legend.text = element_text(size = fnt),
        legend.background = element_rect(color = "black", linewidth=0.3),
        plot.caption.position = "plot",
        #NOT LEGEND
        axis.title = element_text(size = fnt, color = "black"),
        axis.text = element_text(size = fnt, color = "black"),
        axis.line = element_line(colour = "black",
                                 lineend = "square"),
        
        axis.ticks = element_line(color="black"),
        panel.grid = element_blank(),
        panel.grid.major.y = element_line(linewidth=0.4, color= "#e5e7eb"),
        panel.border = element_blank(),
        plot.margin = unit(plt_marg, "pt")
  ) + 
  coord_cartesian(clip = "off") #Avoid clip of grid line


black_pace_plt

ggsave("images/01 - Energetic cost of running per mile.png", black_pace_plt,
       width = 1600, height = 1200, units = "px")




# -- Minetti plot 

cr_col <- "#7570b3"

grad_breaks <- seq(-0.5,0.5,by=0.1)
grad_labs <- sprintf("%.0f", grad_breaks*100)



minetti_plot <- df_incline_plot %>%
  ggplot(aes(x=slope, y=Cr)) + 
  geom_vline(xintercept=0, linetype="dotted", color="#e5e7eb") + 
  geom_line(aes(y=minetti_Cr_eqn),
            color = cr_col, linewidth = lwd, 
            alpha = 0.8) +
  #Axes
  scale_x_continuous(limits = c(-0.5,0.5), breaks = grad_breaks,
                     name = "Hill grade (%)", 
                     labels = grad_labs,
                     expand = c(0.025,0))  + 
  scale_y_continuous(limits = c(0,25),
                     name = "Energetic cost (J/kg/m)",
                     expand = c(0,0))  +
  ggtitle("Energetic cost of hill running",
          subtitle = "Data from Minetti et al. 2002") + 
  labs(caption = "RunningWritings.com") + 
  theme_bw() + 
  theme(plot.title = element_text(hjust = 0.5, size=title_fnt),
        plot.subtitle = element_text(hjust = 0.5, size=subtitle_fnt),
        plot.caption = element_text(face = "bold", size = wm_fnt, vjust=0),
        legend.position = "bottom",
        legend.text = element_text(size = fnt),
        legend.justification = "left",
        plot.caption.position = "plot",
        axis.title = element_text(size = fnt, color = "black"),
        axis.text = element_text(size = fnt, color = "black"),
        axis.line = element_line(colour = "black",
                                 lineend = "square"),
        axis.ticks = element_line(color="black"),
        panel.border = element_blank(),
        panel.grid = element_blank(),
        panel.grid.major.y = element_line(linewidth=0.4, color= "#e5e7eb"),
        plot.margin = unit(plt_marg, "pt")
  ) + 
  coord_cartesian(clip = "off")

minetti_plot


ggsave("images/02 - Energetic cost of running on inclines and declines.png", 
       minetti_plot,
       width = 1600, height = 1200, units = "px")


# --- Both to scale


lwd <- 1
alf <- 0.8

title_fnt <- 12
fnt <- 10


pace_labs <- c("14:00","10:00","8:00", "5:00")


plt_1 <- df_speed_plot %>%  
  filter(category == "Elite") %>%
  ggplot(aes(x=pace_min_mi, y=energy_j_kg_m)) +
  geom_line(aes(x=pace_min_mi, y=cr_hat, color=category),
            linetype="solid",
            color = "#377eb8",
            alpha = alf,
            linewidth = lwd) + 
  scale_x_reverse(limits = c(15,5), breaks = c(14,10,8,5),
                  labels = pace_labs,
                  expand = c(0,0),
                  name = "Pace (min/mi)") + 
  scale_y_continuous(limits = c(0,25), breaks = seq(0,25,by=5),
                     name = "Energetic cost (J/kg/m)",
                     expand = c(0,0)) + 
  ggtitle("Flat-ground running") + 
  theme_bw() + 
  theme(plot.title = element_text(hjust = 0.5, size=title_fnt),
        plot.caption = element_text(face = "bold", size = wm_fnt, vjust=0),
        legend.position = "none",
        legend.justification = "left",
        plot.caption.position = "plot",
        axis.title = element_text(size = fnt, color = "black"),
        axis.text = element_text(size = fnt, color = "black"),
        axis.line = element_line(colour = "black",
                                 lineend = "square"),
        axis.ticks = element_line(color="black"),
        panel.border = element_blank(),
        panel.grid = element_blank(),
        panel.grid.major.y = element_line(linewidth=0.2, color= "#e5e7eb"),
        plot.margin = unit(c(10,10,10,10), "pt")
  ) + 
  coord_cartesian(clip = "off")


plt_1




plt_2 <- df_incline_plot %>%
  ggplot(aes(x=slope, y=Cr)) + 
  geom_vline(xintercept=0, linetype="dotted", color="#e5e7eb", linewidth=0.3) + 
  geom_line(aes(y=minetti_Cr_eqn),
            color = cr_col, linewidth = lwd, 
            alpha = alf) +
  #Axes
  scale_x_continuous(limits = c(-0.5,0.5), breaks = seq(-0.5,0.5,by=0.25),
                     labels = 100*seq(-0.5,0.5,by=0.25),
                     name = "Hill grade (%)", 
                     expand = c(0.025,0)) +
  scale_y_continuous(limits = c(0,25), breaks = seq(0,25,by=5),
                     name = NULL,
                     expand = c(0,0)) + 
  ggtitle("Uphill/downhill running") + 
  theme_bw() + 
  theme(plot.title = element_text(hjust = 0.5, size=title_fnt),
        plot.caption = element_text(face = "bold", size = wm_fnt, vjust=0),
        legend.position = "none",
        legend.justification = "left",
        plot.caption.position = "plot",
        axis.title = element_text(size = fnt, color = "black"),
        axis.text = element_text(size = fnt, color = "black"),
        axis.line = element_line(colour = "black",
                                 lineend = "square"),
        axis.ticks = element_line(color="black"),
        panel.border = element_blank(),
        panel.grid = element_blank(),
        panel.grid.major.y = element_line(linewidth=0.2, color= "#e5e7eb"),
        plot.margin = unit(c(10,10,10,10), "pt")
  ) + 
  coord_cartesian(clip = "off")


plt_2



cow <- plot_grid(plt_1, plt_2, ncol=2)
cow


ggsave("images/03 - Inclines vs speed - energetic cost of running.png", 
       cow,
       width = 1600, height = 800, units = "px")




