#Export black gam


library(mgcv)
library(tidyverse)
library(jsonlite)

n_total <- 24 + 68 #Total N in Black et al. 2018

#Black et al digitized data
df <- read_csv("black_data_all.csv", show_col_types = FALSE) %>%
  #Speed in m/s, Cr in J/kg/m
  mutate(speed_m_s = speed_kmh/3.6,
         energy_j_kg_m = energy_kcal_kg_km*4.184,
         category = factor(category, 
                           levels = c("recreational", "elite"))
  ) %>%
  #SD is average of +/-1 sd
  mutate(st_dev = 0.5*(energy_kcal_kg_km - sd_lower) + 0.5*(sd_upper - energy_kcal_kg_km),
         st_dev_joules = st_dev*4.184) %>%
  #Weights should be (1/variance) * (n_group / n_total), SD squared is variance 
  mutate(reg_weight = 1/(st_dev_joules**2)*n_group*n_total) %>%
  #normalize weights
  mutate(reg_weight = reg_weight/sum(reg_weight))


# -- Fit gam
wt_mod <- gam(energy_j_kg_m ~ s(speed_m_s, bs="cr", k=4) + category,
              data = df,
              weights = reg_weight)
summary(wt_mod)
plot(wt_mod)


# --- Grid for data analysis in javascript ---
#Can make bigger later if needed
ng_java <- 201
java_df <- data.frame(speed_m_s = seq(0,10, length.out = ng_java),
                      category = factor("elite"))

#Foollowing 
#https://stats.stackexchange.com/questions/406566
#I don't really see how this is different from predict.gam() but whatever

lp_mat <- predict(wt_mod, newdata = java_df, type="lpmatrix")
beta_coef <- coef(wt_mod)
pred_mat <- lp_mat %*% beta_coef

export_df <- data.frame(speed_m_s = java_df$speed_m_s,
                        energy_j_kg_m = pred_mat,
                        energy_j_kg_s = pred_mat*java_df$speed_m_s)

json_data <- toJSON(export_df, pretty = TRUE, dataframe = 'columns')

# Write the JSON to a file
write(json_data, "black_data_gam.json")
