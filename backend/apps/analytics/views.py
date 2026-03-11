from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDay, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.transactions.models import Transaction
from apps.core.services.openrouter_service import openrouter_service
import os


class SummaryView(APIView):
    """
    Общая сводка за период.
    GET /api/v1/analytics/summary/?days=30
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        transactions = Transaction.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        )

        total_expenses = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        total_income = transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0

        # Топ категорий
        top_categories = transactions.filter(type='expense').values(
            'category__name', 'category__color'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')[:5]

        # Средняя транзакция
        avg_transaction = transactions.filter(type='expense').aggregate(
            Avg('amount')
        )['amount__avg'] or 0

        # Количество транзакций
        expense_count = transactions.filter(type='expense').count()
        income_count = transactions.filter(type='income').count()

        return Response({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'total_expenses': float(total_expenses),
            'total_income': float(total_income),
            'balance': float(total_income - total_expenses),
            'average_transaction': float(avg_transaction),
            'top_categories': [
                {
                    'name': item['category__name'] or 'Без категории',
                    'color': item['category__color'] or '#CCCCCC',
                    'total': float(item['total'])
                }
                for item in top_categories
            ],
            'transaction_count': transactions.count(),
            'expense_count': expense_count,
            'income_count': income_count
        })


class DailyTrendView(APIView):
    """
    Динамика расходов по дням.
    GET /api/v1/analytics/daily/?days=30
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        daily = Transaction.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        ).annotate(
            day=TruncDay('date')
        ).values('day').annotate(
            expenses=Sum('amount', filter=Q(type='expense')),
            income=Sum('amount', filter=Q(type='income'))
        ).order_by('day')

        result = [
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'expenses': float(item['expenses'] or 0),
                'income': float(item['income'] or 0)
            }
            for item in daily
        ]

        return Response({'daily_data': result})


class MonthlyTrendView(APIView):
    """
    Динамика расходов по месяцам.
    GET /api/v1/analytics/monthly/?months=12
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30 * months)

        monthly = Transaction.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            expenses=Sum('amount', filter=Q(type='expense')),
            income=Sum('amount', filter=Q(type='income')),
            count=Count('id')
        ).order_by('month')

        result = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'expenses': float(item['expenses'] or 0),
                'income': float(item['income'] or 0),
                'balance': float((item['income'] or 0) - (item['expenses'] or 0)),
                'transaction_count': item['count']
            }
            for item in monthly
        ]

        return Response({'monthly_data': result})


class AIInsightsView(APIView):
    """
    AI-рекомендации от внешнего API.
    GET /api/v1/analytics/ai-insights/?days=30
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.core.cache import cache
        from django.utils import timezone

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Проверяем кэш
        cache_key = f'ai_insights_{request.user.id}_{days}'
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(cached_result)

        transactions = Transaction.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        )

        # Собираем данные для отправки в AI API
        total_expenses = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        total_income = transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        balance = total_income - total_expenses

        top_expense_categories = transactions.filter(type='expense').values(
            'category__name'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')[:5]

        expense_count = transactions.filter(type='expense').count()
        income_count = transactions.filter(type='income').count()

        financial_data = {
            'period_days': days,
            'total_expenses': float(total_expenses),
            'total_income': float(total_income),
            'balance': float(balance),
            'expense_count': expense_count,
            'income_count': income_count,
            'top_categories': [
                {'name': cat['category__name'] or 'Без категории', 'total': float(cat['total'])}
                for cat in top_expense_categories
            ]
        }

        # Если нет транзакций
        if transactions.count() == 0:
            result = {
                'insights': [
                    {
                        'category': 'Информация',
                        'insight': 'Добавьте транзакции для получения рекомендаций',
                        'type': 'info'
                    }
                ],
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                },
                'summary': financial_data
            }
            cache.set(cache_key, result, 3600)
            return Response(result)

        # Получаем рекомендации через OpenRouter AI
        print(f'[AIInsights] Calling OpenRouter service with data: {financial_data}')
        insights = openrouter_service.analyze_financial_data(financial_data)
        print(f'[AIInsights] Received {len(insights)} insights from OpenRouter')

        result = {
            'insights': insights,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'summary': financial_data
        }

        # Кэшируем только успешные ответы (если есть рекомендации)
        if insights and insights[0].get('category') != 'Ошибка подключения':
            cache.set(cache_key, result, 3600)  # 1 час
        else:
            # При ошибке кэшируем на 5 минут чтобы не спамить API
            cache.set(cache_key, result, 300)
            print('[AIInsights] Error response cached for 5 minutes')

        return Response(result)
