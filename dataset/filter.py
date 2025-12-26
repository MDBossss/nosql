import os
import pandas as pd

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'student-mat.csv')
df = pd.read_csv(csv_path, sep=';')

# Filtriraj redove gdje je G1 <= 10
filtered_df = df[df['G1'] <= 10]

# Spremi filtrirane podatke u novi CSV
filtered_df.to_csv('student-mat-G1-leq-10.csv', index=False)