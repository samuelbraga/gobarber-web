import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiClock, FiPower } from 'react-icons/fi';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppoitment,
  Calendar,
  Appoitment,
  Section,
} from './styles';
import { useAuth } from '../../hooks/auth';

import logoImg from '../../assets/logo.svg';
import api from '../../services/api';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  useEffect(() => {
    api
      .get(`/providers/${user.id}/month-availability`, {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        },
      })
      .then((reposnse) => {
        setMonthAvailability(reposnse.data);
      });
  }, [currentMonth, user.id]);

  const disableDays = useMemo(() => {
    const unavailableDates = monthAvailability.filter(
      (monthDay) => monthDay.available === false,
    );

    const dates = unavailableDates.map((unavailableDate) => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      return new Date(year, month, unavailableDate.day);
    });

    return dates;
  }, [currentMonth, monthAvailability]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarber" />
          <Profile>
            <img src={user.avatar_url} alt={user.name} />

            <div>
              <span>Bem-vindo</span>
              <strong>{user.name}</strong>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>

      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            <span>Hoje</span>
            <span>Dia 06</span>
            <span>Segunda-feira</span>
          </p>

          <NextAppoitment>
            <strong>Atendimento a seguir</strong>
            <div>
              <img
                src="https://avatars0.githubusercontent.com/u/18483769?s=460&u=79d87b8315cae91b36d7390fb18f8637488bf434&v=4"
                alt="Samuel Braga"
              />

              <strong>Samuel Braga</strong>
              <span>
                <FiClock />
                08:00
              </span>
            </div>
          </NextAppoitment>

          <Section>
            <strong>Manhã</strong>
            <Appoitment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="https://avatars0.githubusercontent.com/u/18483769?s=460&u=79d87b8315cae91b36d7390fb18f8637488bf434&v=4"
                  alt="Samuel Braga"
                />

                <strong>Samuel Braga</strong>
              </div>
            </Appoitment>
            <Appoitment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="https://avatars0.githubusercontent.com/u/18483769?s=460&u=79d87b8315cae91b36d7390fb18f8637488bf434&v=4"
                  alt="Samuel Braga"
                />

                <strong>Samuel Braga</strong>
              </div>
            </Appoitment>
          </Section>

          <Section>
            <strong>Tarde</strong>
            <Appoitment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="https://avatars0.githubusercontent.com/u/18483769?s=460&u=79d87b8315cae91b36d7390fb18f8637488bf434&v=4"
                  alt="Samuel Braga"
                />

                <strong>Samuel Braga</strong>
              </div>
            </Appoitment>
          </Section>
        </Schedule>
        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disableDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
